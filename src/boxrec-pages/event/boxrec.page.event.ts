import {townRegionCountryRegex, trimRemoveLineBreaks} from "../../helpers";
import {BoxrecCommonTablesClass} from "../boxrec-common-tables/boxrec-common-tables.class";
import {BoxrecBasic, BoxrecBoutLocation} from "../boxrec.constants";
import {BoxrecRole} from "../search/boxrec.search.constants";
import {BoxrecPromoter} from "./boxrec.event.constants";
import {BoxrecPageEventBoutRow} from "./boxrec.page.event.bout.row";

const cheerio: CheerioAPI = require("cheerio");

/**
 * Parse an Event page
 */
export class BoxrecPageEvent extends BoxrecCommonTablesClass {

    protected _doctor: string | null;
    protected _matchmaker: string | null;
    protected _promoter: string | null;
    private _commission: string;
    private _inspector: string | null;
    private _television: string;

    constructor(boxrecBodyString: string) {
        super();
        this.$ = cheerio.load(boxrecBodyString);
    }

    get bouts(): BoxrecPageEventBoutRow[] {
        const bouts: Array<[string, string | null]> = this.parseBouts();
        const boutsList: BoxrecPageEventBoutRow[] = [];
        bouts.forEach((val: [string, string | null]) => {
            const bout: BoxrecPageEventBoutRow = new BoxrecPageEventBoutRow(val[0], val[1]);
            boutsList.push(bout);
        });

        return boutsList;
    }

    get commission(): string | null {
        const commission: string | void = this.parseEventData("commission");
        if (commission) {
            return commission.trim();
        }

        return null;
    }

    get date(): string | null {
        let date: string = this.$(this.getEventResults()).find("h2").text(); // ex. Saturday 5, May 2018

        if (date) {
            // if date hasn't been set, this will be an empty string, leave as null
            date = new Date(date).toISOString().slice(0, 10);
            return trimRemoveLineBreaks(date);
        }

        return date;
    }

    get doctors(): BoxrecBasic[] {
        const doctorsStr: string | void = this.parseEventData(BoxrecRole.doctor);
        const html: Cheerio = this.$(`<div>${doctorsStr}</div>`);
        const doctors: BoxrecBasic[] = [];

        html.find("a").each((i: number, elem: CheerioElement) => {
            const doctor: BoxrecBasic = super.parseNameAndId(this.$.html(elem));
            doctors.push(doctor);
        });

        return doctors;
    }

    get id(): number {
        const wikiHref: string | null = this.$(this.getEventResults()).find("h2").next().find(".bio_closedP").parent().attr("href");
        let id: string = "";

        if (wikiHref) {
            const wikiLink: RegExpMatchArray | null = wikiHref.match(/(\d+)$/);
            if (wikiLink && wikiLink[1]) {
                id = wikiLink[1];
            }
        }

        return parseInt(id, 10);
    }

    get inspectors(): BoxrecBasic[] {
        const inspectorStr: string | void = this.parseEventData(BoxrecRole.inspector);
        const html: Cheerio = this.$(`<div>${inspectorStr}</div>`);
        const inspectors: BoxrecBasic[] = [];

        html.find("a").each((i: number, elem: CheerioElement) => {
            const inspector: BoxrecBasic = super.parseNameAndId(this.$(elem).text());
            inspectors.push(inspector);
        });

        return inspectors;
    }

    get location(): BoxrecBoutLocation {
        const locationObject: BoxrecBoutLocation = {
            location: {
                country: null,
                id: null,
                region: null,
                town: null,
            },
            venue: {
                id: null,
                name: null,
            },
        };

        const locationStr: string = this.$(this.getEventResults()).find("thead table > tbody tr:nth-child(2) b").html() as string;
        const html: Cheerio = this.$(`<div>${locationStr}</div>`);
        const links: Cheerio = html.find("a");
        const venueId: RegExpMatchArray | null = links.get(0).attribs.href.match(/(\d+)$/);
        const venueName: string | undefined = links.get(0).children[0].data;

        // if the number of links is 2, the link with all the information changes position // 2 is 0, 3/4 is 1
        const hrefPosition: number = +(links.length === 3 || links.length === 4);

        const locationMatches: RegExpMatchArray | null = links.get(hrefPosition).attribs.href.match(townRegionCountryRegex) as string[];

        if (venueId && venueId[1] && venueName) {
            locationObject.venue.id = parseInt(venueId[1], 10);
            locationObject.venue.name = venueName;
        }

        if (locationMatches) {
            const [, , , townId] = locationMatches;

            locationObject.location.id = parseInt(townId, 10);
            locationObject.location.town = links.get(1).children[0].data as string;

            // there are 2-4 links
            // 2-3 usually means `region` is missing, 4 means it has town, region, country and venue
            if (links.length === 4) {
                locationObject.location.region = links.get(2).children[0].data as string;
                locationObject.location.country = links.get(3).children[0].data as string;
            } else if (links.length === 3) {
                locationObject.location.country = links.get(2).children[0].data as string;
            } else if (links.length === 2) {
                locationObject.location.town = links.get(0).children[0].data as string;
                locationObject.location.country = links.get(1).children[0].data as string;
            }
        }

        return locationObject;
    }

    get matchmakers(): BoxrecBasic[] {
        const matchMakersStr: string | void = this.parseEventData(BoxrecRole.matchmaker);
        const html: Cheerio = this.$(`<div>${matchMakersStr}</div>`);
        const matchmaker: BoxrecBasic[] = [];

        html.find("a").each((i: number, elem: CheerioElement) => {
            const href: RegExpMatchArray | null = this.$(elem).get(0).attribs.href.match(/(\d+)$/);
            if (href) {
                const name: string = this.$(elem).text();
                matchmaker.push({
                    id: parseInt(href[1], 10),
                    name,
                });
            }

        });

        return matchmaker;
    }

    get promoters(): BoxrecPromoter[] {
        const promoterStr: string | void = this.parseEventData(BoxrecRole.promoter);
        const html: Cheerio = this.$(`<div>${promoterStr}</div>`);
        const promoter: BoxrecPromoter[] = [];

        html.find("a").each((i: number, elem: CheerioElement) => {
            const href: string = this.$(elem).get(0).attribs.href;
            const name: string = this.$(elem).text();
            let id: number | null = null;
            let company: string | null = null;

            const matches: RegExpMatchArray | null = href.match(/(\d+)$/);

            if (matches) {
                id = parseInt(matches[0], 10);
            }

            const htmlString: string | null = html.html();

            if (htmlString) {
                // this regex may not work for everything (this comment was about `event` pages)
                // turns out `events` page and `bout` page display promoters differently
                // ex. of links between `event` pages and `bout` pages
                // events - `Golden Boy Promotions - Oscar De La Hoya`
                // bouts  - `Oscar De La Hoya (Golden Boy Promotions)`

                // first we'll figure out which one we're looking at, then choose the proper regex to use
                // we should also assume that both might fail

                // these both share the same characters for company names
                // capture forward slashes in it because `360/GGG/K2 Promotions`
                const promoterEventsPageRegex: RegExp = /([\w\d\/\-\s]+)\s-\s<a\shref/g;
                const promoterBoutsPageRegex: RegExp = /\(([\w\d\/\-\s]+)\)/g;

                const eventsRegexReturnsResults: RegExpMatchArray | null = promoterEventsPageRegex.exec(htmlString);

                let regexThatGetsResults: RegExp;

                if (eventsRegexReturnsResults !== null) {
                    regexThatGetsResults = promoterEventsPageRegex;
                } else {
                    const boutsRegexReturnsResults: RegExpMatchArray | null = promoterBoutsPageRegex.exec(htmlString);

                    if (boutsRegexReturnsResults !== null) {
                        regexThatGetsResults = promoterBoutsPageRegex;
                    } else {
                        // both regex did not work, either broken or they don't exist
                        return promoter;
                    }
                }

                regexThatGetsResults.lastIndex = 0; // reset the index of the `RegExp` // requires `g` flag on regex

                let m: RegExpExecArray | null;
                let j: number = 0;

                do {
                    m = regexThatGetsResults.exec(htmlString);
                    if (m && m[1]) {
                        if (j === promoter.length) {
                            company = m[1].trim();
                        }
                    }
                    j++;
                } while (m);

                if (company) {
                    promoter.push({
                        company,
                        id,
                        name,
                    });
                }
            }

        });

        return promoter;
    }

    get television(): string[] {
        const television: string | void = this.parseEventData("television");

        if (television) {
            return television.split(",").map(item => trimRemoveLineBreaks(item));
        }

        return [];
    }

    private getEventResults(): Cheerio {
        return this.$("table#eventResults");
    }

    private parseBouts(): Array<[string, string | null]> {
        const tr: Cheerio = this.$("table#eventResults > tbody tr");
        const bouts: Array<[string, string | null]> = [];

        tr.each((i: number, elem: CheerioElement) => {
            const boutId: string = this.$(elem).attr("id");

            // skip rows that are associated with the previous fight
            if (!boutId || boutId.includes("second")) {
                return;
            }

            // we need to check to see if the next row is associated with this bout
            let isNextRowAssociated: boolean = false;
            let nextRow: Cheerio | null = this.$(elem).next();
            let nextRowId: string = nextRow.attr("id");

            if (nextRowId) {
                nextRowId = nextRowId.replace(/[a-zA-Z]/g, "");

                isNextRowAssociated = nextRowId === boutId;
                if (!isNextRowAssociated) {
                    nextRow = null;
                }
            } // else if no next bout exists

            const html: string = this.$(elem).html() || "";
            const next: string | null = nextRow ? nextRow.html() : null;
            bouts.push([html, next]);
        });

        return bouts;
    }

    private parseEventData(role: string): string | null {
        const eventResults: Cheerio = this.getEventResults();

        let result: string | null = null;

        this.$(eventResults).find("thead table tbody tr").each((i: number, elem: CheerioElement) => {
            const tag: string = this.$(elem).find("td:nth-child(1)").text().trim();
            const val: Cheerio = this.$(elem).find("td:nth-child(2)");

            if (tag === "commission" && role === "commission") {
                result = val.text();
            } else if (tag === "promoter") {
                result = val.html();
            } else if (tag === "matchmaker") {
                result = val.html();
            } else if (tag === "television") {
                result = val.text();
            } else if (tag === "doctor") {
                result = val.html();
            } else if (tag === "inspector") {
                result = val.html();
            }
        });

        return result;
    }

}

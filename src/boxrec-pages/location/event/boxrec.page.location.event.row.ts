import {trimRemoveLineBreaks} from "../../../helpers";
import {BoxrecCommonTablesClass} from "../../boxrec-common-tables/boxrec-common-tables.class";
import {BoxrecBasic, Location} from "../../boxrec.constants";

const cheerio: CheerioAPI = require("cheerio");

export class BoxrecPageLocationEventRow extends BoxrecCommonTablesClass {

    constructor(boxrecBodyBout: string) {
        super();
        const html: string = `<table><tr>${boxrecBodyBout}</tr></table>`;
        this.$ = cheerio.load(html);
    }

    get date(): string {
        return trimRemoveLineBreaks(this.getColumnData(2, false));
    }

    get day(): string {
        return this.getColumnData(3, false);
    }

    get id(): number | null {
        return super.parseId(this.getColumnData(6, true));
    }

    get location(): Location {
        return super.parseLocationLink(this.getColumnData(5, true), 2);
    }

    get venue(): BoxrecBasic {
        const html: Cheerio = this.$(`<div>${this.getColumnData(4, true)}</div>`);
        const venue: BoxrecBasic = {
            id: null,
            name: null,
        };

        html.find("a").each((i: number, elem: CheerioElement) => {
            const href: RegExpMatchArray | null = this.$(elem).get(0).attribs.href.match(/(\d+)$/);
            if (href) {
                venue.name = this.$(elem).text();
                venue.id = parseInt(href[1], 10);
            }

        });

        return venue;
    }

    private get hasMoreColumns(): boolean {
        // on pages where it's about a specific weight class, the division column is omitted
        return this.$(`tr:nth-child(1) td`).length === 7;
    }

}

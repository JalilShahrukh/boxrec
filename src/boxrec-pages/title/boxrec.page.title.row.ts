import {getColumnData, trimRemoveLineBreaks} from "../../helpers";
import {BoxrecCommonTablesClass} from "../boxrec-common-tables/boxrec-common-tables.class";
import {BoxrecBasic, Location, WinLossDraw} from "../boxrec.constants";
import {BoxingBoutOutcome} from "../event/boxrec.event.constants";

const cheerio: CheerioAPI = require("cheerio");
let $: CheerioStatic;

export class BoxrecPageTitleRow extends BoxrecCommonTablesClass {

    private _links: string; // todo, works?  no tests (this._links = getColumnData(this.$, 11);)

    constructor(tableRowInnerHTML: string, metadataFollowingRowInnerHTML: string | null = null) {
        super();
        const html: string = `<table><tr>${tableRowInnerHTML}</tr><tr>${metadataFollowingRowInnerHTML}</tr></table>`;
        this.$ = cheerio.load(html);
    }

    get date(): string {
        return trimRemoveLineBreaks(getColumnData(this.$, 1, false));
    }

    get firstBoxer(): BoxrecBasic {
        return this.parseNameAndId(getColumnData(this.$, 2));
    }

    get firstBoxerWeight(): number | null {
        const html: string | null = getColumnData(this.$, 3, false);
        return html ? super.parseFirstBoxerWeight(html) : null;
    }

    get location(): Location {
        return super.parseLocationLink(getColumnData(this.$, 7), 1);
    }

    get numberOfRounds(): number[] {
        const numberOfRounds: string = trimRemoveLineBreaks(getColumnData(this.$, 9, false));
        if (numberOfRounds.includes("/")) {
            // ended early
            return numberOfRounds.split("/").map(item => parseInt(item, 10));
        }

        const parsedNumberOfRounds: number = parseInt(numberOfRounds, 10);
        // went to decision
        return [parsedNumberOfRounds, parsedNumberOfRounds];
    }

    get rating(): number | null {
        const html: string | null = getColumnData(this.$, 10);
        return html ? super.parseRating(html) : null;
    }

    get secondBoxer(): BoxrecBasic {
        return super.parseNameAndId(getColumnData(this.$, 5));
    }

    get secondBoxerWeight(): number | null {
        const html: string | null = getColumnData(this.$, 6, false);
        return html ? super.parseFirstBoxerWeight(html) : null;
    }

    get outcome(): WinLossDraw {
        return BoxrecCommonTablesClass.parseOutcome(getColumnData(this.$, 4, false));
    }

    protected get metadata(): string {
        const el: Cheerio = this.$(`tr:nth-child(2) td:nth-child(1)`);
        return el.html() || "";
    }

    /**
     * @hidden
     */
    private outcomeByWayOf(parseText: boolean = false): BoxingBoutOutcome | string | null {
        return BoxrecCommonTablesClass.parseOutcomeByWayOf(getColumnData(this.$, 8, false), parseText);
    }

}

import {getColumnData, trimRemoveLineBreaks} from "../../../helpers";
import {BoxrecCommonTablesClass} from "../../boxrec-common-tables/boxrec-common-tables.class";
import {Location} from "../../boxrec.constants";

const cheerio: CheerioAPI = require("cheerio");

export class BoxrecPageLocationPeopleRow extends BoxrecCommonTablesClass {

    constructor(boxrecBodyBout: string) {
        super();
        const html: string = `<table><tr>${boxrecBodyBout}</tr></table>`;
        this.$ = cheerio.load(html);
    }

    get id(): number {
        return super.parseId(this.idNameColumn) as number;
    }

    get idNameColumn(): string {
        return getColumnData(this.$, 3);
    }

    /**
     * Some of the results may come back with just the `country`
     * ex. if you search USA, you'll get people "0 miles" from USA, and the region/town is excluded
     * @returns {Location}
     */
    get location(): Location {
        return super.parseLocationLink(getColumnData(this.$, 2));
    }

    get miles(): number {
        return parseInt(getColumnData(this.$, 1, false), 10);
    }

    get name(): string {
        return super.parseName(this.idNameColumn) as string;
    }

    get sex(): "male" | "female" {
        return trimRemoveLineBreaks(getColumnData(this.$, 4, false)) as "male" | "female";
    }

}

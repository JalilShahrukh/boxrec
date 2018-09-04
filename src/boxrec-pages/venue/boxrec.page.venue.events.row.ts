import {getColumnData, trimRemoveLineBreaks} from "../../helpers";
import {BoxrecCommonTablesClass} from "../boxrec-common-tables/boxrec-common-tables.class";
import {Location} from "../boxrec.constants";

const cheerio: CheerioAPI = require("cheerio");

export class BoxrecPageVenueEventsRow extends BoxrecCommonTablesClass {

    constructor(boxrecBodyBout: string) {
        super();
        const html: string = `<table><tr>${boxrecBodyBout}</tr></table>`;
        this.$ = cheerio.load(html);
    }

    get date(): string {
        return trimRemoveLineBreaks(getColumnData(this.$, 2));
    }

    get day(): string {
        return getColumnData(this.$, 3);
    }

    get id(): number | null {
        return super.parseId(getColumnData(this.$, 5));
    }

    get location(): Location {
        return super.parseLocationLink(getColumnData(this.$, 4), 2);
    }

}

import {getColumnData} from "../../helpers";
import {BoxrecCommonTablesClass} from "../boxrec-common-tables/boxrec-common-tables.class";
import {Location, Record, WinLossDraw} from "../boxrec.constants";
import {WeightDivision} from "../champions/boxrec.champions.constants";

const cheerio: CheerioAPI = require("cheerio");

export class BoxrecPageSearchRow extends BoxrecCommonTablesClass {

    constructor(boxrecBodySearchRow: string) {
        super();
        const html: string = `<table><tr>${boxrecBodySearchRow}</tr></table>`;
        this.$ = cheerio.load(html);
    }

    get alias(): string | null {
        return BoxrecCommonTablesClass.parseAlias(getColumnData(this.$, 2, false));
    }

    get career(): Array<number | null> {
        return BoxrecCommonTablesClass.parseCareer(getColumnData(this.$, 6, false));
    }

    get division(): WeightDivision | null {
        return BoxrecCommonTablesClass.parseDivision(getColumnData(this.$, 5, false));
    }

    get id(): number {
        return super.parseId(getColumnData(this.$, 1)) as number;
    }

    get last6(): WinLossDraw[] {
        return super.parseLast6Column(getColumnData(this.$, 4));
    }

    get name(): string | null {
        return super.parseName(getColumnData(this.$, 1));
    }

    get record(): Record {
        return super.parseRecord(getColumnData(this.$, 3));
    }

    get residence(): Location {
        return super.parseLocationLink(getColumnData(this.$, 7));
    }
}

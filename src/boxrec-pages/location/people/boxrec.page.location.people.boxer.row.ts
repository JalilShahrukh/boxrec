import {getColumnData} from "../../../helpers";
import {BoxrecCommonTablesClass} from "../../boxrec-common-tables/boxrec-common-tables.class";
import {Record} from "../../boxrec.constants";
import {WeightDivision} from "../../champions/boxrec.champions.constants";
import {BoxrecPageLocationPeopleRow} from "./boxrec.page.location.people.row";

const cheerio: CheerioAPI = require("cheerio");

export class BoxrecPageLocationPeopleBoxerRow extends BoxrecPageLocationPeopleRow {

    constructor(boxrecBodyBout: string) {
        super(boxrecBodyBout);
        const html: string = `<table><tr>${boxrecBodyBout}</tr></table>`;
        this.$ = cheerio.load(html);
    }

    get career(): Array<number | null> {
        return BoxrecCommonTablesClass.parseCareer(getColumnData(this.$, 7));
    }

    get division(): WeightDivision | null {
        return super.parseDivision(getColumnData(this.$, 6, false));
    }

    get record(): Record {
        return super.parseRecord(getColumnData(this.$, 5));
    }

}
import {getColumnData, trimRemoveLineBreaks} from "../../helpers";
import {BoxrecCommonTablesClass} from "../boxrec-common-tables/boxrec-common-tables.class";
import {Location, Record, Stance, WinLossDraw} from "../boxrec.constants";
import {WeightDivision} from "../champions/boxrec.champions.constants";

const cheerio: CheerioAPI = require("cheerio");

export class BoxrecPageRatingsRow extends BoxrecCommonTablesClass {

    constructor(boxrecBodyBout: string, additionalData: string | null = null) {
        super();
        const html: string = `<table><tr>${boxrecBodyBout}</tr><tr>${additionalData}</tr></table>`;
        this.$ = cheerio.load(html);
    }

    get age(): number | null {
        const age: string = this.getColumnData(5, false);
        if (age) {
            return parseInt(age, 10);
        }

        return null;
    }

    get division(): WeightDivision | null {
        if (this.hasDivision) {
            return super.parseDivision(getColumnData(this.$, 5, false));
        }

        return null;
    }

    get rating(): number | null {
        return super.parseRating(getColumnData(this.$, 4));
    }

    get hasBoutScheduled(): boolean | null {
        const idName: string = this.idNameColumn;
        if (idName) {
            const html: Cheerio = this.$(`<div>${idName}</div>`);
            let name: string = html.text();
            name = name.trim();
            return name.slice(-1) === "*";
        }

        return null;
    }

    get id(): number {
        return super.parseId(this.idNameColumn) as number;
    }

    get last6(): WinLossDraw[] {
        return super.parseLast6Column(this.getColumnData(6, true));
    }

    get name(): string {
        return super.parseName(this.idNameColumn);
    }

    get points(): number | null {
        const points: number = parseInt(getColumnData(this.$, 3, false), 10);

        if (!isNaN(points)) {
            return points;
        }

        return null;
    }

    get ranking(): number | null {
        const ranking: string = getColumnData(this.$, 1, false);
        if (ranking) {
            return parseInt(ranking, 10);
        }

        return null;
    }

    get record(): Record {
        return super.parseRecord(this.getColumnData(6));
    }

    get residence(): Location {
        return super.parseLocationLink(this.getColumnData(8, true));
    }

    get stance(): Stance | null {
        const stance: string = this.getColumnData(7, false);
        if (stance) {
            return trimRemoveLineBreaks(stance) as Stance;
        }

        return null;
    }

    private get hasDivision(): boolean {
        // on pages where it's about a specific weight class, the division column is omitted
        return this.$(`tr:nth-child(1) td`).length === 9;
    }

    private get idNameColumn(): string {
        return getColumnData(this.$, 2);
    }

    /**
     * Passing in what column to get, increases the number by 1 if the number of columns is different
     * @param {number} columnNumber
     * @param {boolean} returnHTML
     * @returns {string}
     */
    private getColumnData(columnNumber: number, returnHTML: boolean = false): string {
        let colNum: number = columnNumber;
        if (this.hasDivision) {
            colNum++;
        }

        return getColumnData(this.$, colNum, returnHTML);
    }

}

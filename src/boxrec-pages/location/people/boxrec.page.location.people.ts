import {BoxrecRole} from "../../search/boxrec.search.constants";
import {BoxrecPageLocationPeopleBoxerRow} from "./boxrec.page.location.people.boxer.row";
import {BoxrecPageLocationPeopleRow} from "./boxrec.page.location.people.row";

const cheerio: CheerioAPI = require("cheerio");

/**
 * parse a BoxRec Locate People results page
 * <pre>ex. http://boxrec.com/en/locations/people?l%5Brole%5D=boxer&l%5Bdivision%5D=&l%5Bcountry%5D=US&l%5Bregion%5D=&l%5Btown%5D=&l_go=</pre>
 */
export class BoxrecPageLocationPeople {

    role: BoxrecRole;

    private $: CheerioStatic;

    constructor(boxrecBodyString: string, role: BoxrecRole = BoxrecRole.boxer) {
        this.$ = cheerio.load(boxrecBodyString);
        this.role = role;
    }

    // todo change this to `people`
    get boxers(): BoxrecPageLocationPeopleRow[] | BoxrecPageLocationPeopleBoxerRow[] {
        return this.parseLocation().map(item => {

            if (this.role === BoxrecRole.boxer) {
                return new BoxrecPageLocationPeopleBoxerRow(item);
            }

            return new BoxrecPageLocationPeopleRow(item);
        });
    }

    private parseLocation(): string[] {
        const tr: Cheerio = this.$("table#locationsTable tbody tr");
        const locations: string[] = [];

        tr.each((i: number, elem: CheerioElement) => {
            const html: string = this.$(elem).html() || "";
            locations.push(html);
        });

        return locations;
    }

}

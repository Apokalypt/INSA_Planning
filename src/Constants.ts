export abstract class Constants {
    // USER INFORMATION
    static readonly LOGIN = process.env.INSA_PLANNING_LOGIN ?? "";
    static readonly PASSWORD = process.env.INSA_PLANNING_PASSWORD ?? "";
    static readonly YEAR_OF_STUDY = 3;

    // LINKS
    static readonly PLANNING_URL = `https://servif-cocktail.insa-lyon.fr/EdT/${this.YEAR_OF_STUDY}IFA.php`;
}

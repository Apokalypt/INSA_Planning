export abstract class Constants {
    // USER INFORMATION
    static readonly LOGIN = process.env.INSA_PLANNING_LOGIN ?? "";
    static readonly PASSWORD = process.env.INSA_PLANNING_PASSWORD ?? "";

    // AGENDA CONFIGURATIONS
    static readonly CONFIGURATIONS = [
        {
            year: 3,
            planning: "https://servif-cocktail.insa-lyon.fr/EdT/3IFA.php",
            channel: "885433068511428648"
        },
        {
            year: 4,
            planning: "https://servif-cocktail.insa-lyon.fr/EdT/4IFA.php",
            channel: "1017761174068146176"
        }
    ];
}

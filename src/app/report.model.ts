export class Report {
  public countryName: string;
  public countryCode: string;
  public totalCases: number;
  public newCases: number;
  public activeCases: number;
  public totalRecovered: number;
  public newRecovered: number;
  public recoveryRate: number;
  public totalDeaths: number;
  public newDeaths: number;
  public mortalityRate: number;

  constructor(apiResponse?: {[key: string]: any}) {
    if (apiResponse === undefined) {
      this.countryCode = '';
      this.countryName = '';
      this.totalCases = 0;
      this.newCases = 0;
      this.activeCases = 0;
      this.totalRecovered = 0;
      this.newRecovered = 0;
      this.recoveryRate = 0;
      this.totalDeaths = 0;
      this.newDeaths = 0;
      this.mortalityRate = 0;
    } else {
      /* This is the same exact code as the update method.
      Not very pretty to have duplicate code, but it's within the same object, so i think it's acceptable */

      // Check if there is a country name. If not, it is global.
      if (apiResponse.hasOwnProperty("Country")) {
        this.countryName = apiResponse["Country"];
        this.countryCode = apiResponse["Slug"];
      } else {
        this.countryName = "World";
        this.countryCode = "world";
      }

      // Parse already available fields
      this.totalCases = apiResponse["TotalConfirmed"];
      this.newCases = apiResponse["NewConfirmed"];
      this.newDeaths = apiResponse["NewDeaths"];
      this.totalDeaths = apiResponse["TotalDeaths"];
      this.newRecovered = apiResponse["NewRecovered"];
      this.totalRecovered = apiResponse["TotalRecovered"];

      // infer remaining fields
      this.activeCases = this.totalCases - (this.totalRecovered + this.totalDeaths);
      this.mortalityRate = this.totalDeaths / this.totalCases;
      this.recoveryRate = this.totalRecovered / this.totalCases;
    }
  }

  public update(apiResponse: {[key: string]: any}) {
    // Check if there is a country name. If not, it is global.
    if (apiResponse.hasOwnProperty("Country")) {
      this.countryName = apiResponse["Country"];
      this.countryCode = apiResponse["Slug"];
    } else {
      this.countryName = "World";
      this.countryCode = "world";
    }

    // Parse already available fields
    this.totalCases = apiResponse["TotalConfirmed"];
    this.newCases = apiResponse["NewConfirmed"];
    this.newDeaths = apiResponse["NewDeaths"];
    this.totalDeaths = apiResponse["TotalDeaths"];
    this.newRecovered = apiResponse["NewRecovered"];
    this.totalRecovered = apiResponse["TotalRecovered"];

    // infer remaining fields
    this.activeCases = this.totalCases - (this.totalRecovered + this.totalDeaths);
    this.mortalityRate = this.totalDeaths / this.totalCases;
    this.recoveryRate = this.totalRecovered / this.totalCases;
  }

    public toString() : string {
      return "Stats object of " + this.countryName;
    }


}

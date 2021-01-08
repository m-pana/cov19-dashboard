import { WeeklyTrend, DailyNewData, DbWeekData } from './weeklytrend';

export class WorldWeeklyTrend implements WeeklyTrend {

  public countryCode : string;
  public countryName : string;
  public firstDate : Date;
  public lastDate : Date;
  public daysData : DailyNewData[];

  constructor (dbWeekData? : DbWeekData) {
    if (dbWeekData === undefined) {
      // Case of empty constructor
      this.firstDate = new Date();
      this.lastDate = new Date();
      this.daysData = [];
      this.countryCode = "";
      this.countryName = "";
    } else {
      // Data is supplied
      this.countryName = dbWeekData["Country"];
      this.countryCode = dbWeekData["CountryCode"];
      this.lastDate = new Date(dbWeekData["DateObtained"]);
      let firstDate = new Date(this.lastDate);
      firstDate.setDate(firstDate.getDate() - 7);
      this.firstDate = firstDate;


      // Copy api data into days. It should work directly.
      this.daysData = dbWeekData["DaysData"];
    }

  }

  public toString() : string {
    return "Weekly trend of country " + this.countryName;
  }

}

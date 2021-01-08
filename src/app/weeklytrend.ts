export interface DailyNewData {
  NewDeaths : number;
  NewRecovered : number;
  NewConfirmed : number;
  //TotalConfirmed : number;
  //TotalDeaths : number;
  //TotalRecovered : number;
}

export interface WeeklyTrend {
  countryCode : string;
  countryName : string;
  firstDate : Date;
  lastDate : Date;
  daysData : DailyNewData[];
}

export interface DbWeekData {
  Country: string,
  CountryCode: string,
  DateObtained: string,
  DaysData: DailyNewData[];
}

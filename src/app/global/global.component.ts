import { Component, OnInit } from '@angular/core';
import { FetcherService } from '../fetcher.service'
import { Report } from '../report.model';
import { WorldWeeklyTrend } from '../worldweeklytrend.model';
import { DbWeekData } from '../weeklytrend';
import { DayOneData } from '../dayonedata';
import { News } from '../news.model';

@Component({
  selector: 'app-global',
  templateUrl: './global.component.html',
  styleUrls: ['./global.component.css']
})
export class GlobalComponent implements OnInit {

  globalReport: Report;
  countriesReports: Map<string, Report>;
  countriesReportsList: Report[];
  worldWeeklyTrend: WorldWeeklyTrend;
  lastUpdated: string;
  dayOneWorld: DayOneData;

  constructor(private fetcher: FetcherService) {
    this.globalReport = new Report();
    this.countriesReports = new Map();
    this.countriesReportsList = [];
    this.worldWeeklyTrend = new WorldWeeklyTrend();
    this.lastUpdated = 'loading...';
    // We initialize dayOneData explicity since it is not a class
    this.dayOneWorld = {
      CountryCode: '',
      Country: '',
      DateObtained: '',
      FirstDate: '',
      DaysData: []
    }
  }

  /** Initializes map of Country name => Country report
  */
  private parseCountries(countryList : [ { [k: string]: any } ]) {
    for (let entry of countryList) {
      let reportItem : Report = new Report();
      reportItem.update(entry);
      this.countriesReports.set(reportItem["countryName"], reportItem);
    }
    this.countriesReportsList = Array.from(this.countriesReports.values());
  }


  ngOnInit(): void {
    console.log("Retrieving data...");
    // Get summary
    this.fetcher.getSummaryReference().valueChanges().subscribe((res: any) => {
      // If it's still undefined, just pass this call. it will become defined soon
      if (res !== undefined) {
        //this.globalReport.update(res["Global"]);
        this.globalReport = new Report(res["Global"]);
        this.parseCountries(res["Countries"]);
        this.lastUpdated = res["DateObtained"];
      }
    });
    // Get world weekiy trend
    this.fetcher.getWeeklyTrend("world").valueChanges().subscribe((res: any) => {
      if (res !== undefined) {
        this.worldWeeklyTrend = new WorldWeeklyTrend(res);
      }
    });
    // Get world day one
    this.fetcher.getDayOne("world").valueChanges().subscribe((res: any) => {
      if (res !== undefined) {
        this.dayOneWorld = res;
      }
    });
  }

  /* Used for testing purposes only */
  insertNewsUtility(): void {
    console.log("Inserting news:");
    let mynews : News = {
      uid: "bikebike",
      username: "E.B.",
      email: "eb@poli.it",
      date: "2020-12-12",
      countryCode: "austria",
      countryName: "Austria",
      title: "Austria News",
      body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    };
    console.log(mynews);
    this.fetcher.insertNews(mynews, "austria", "Austria");
  }

  /* Sort countries reports list according to given field */
  sortCountriesReports(key: string, ascending: boolean) {
    let multiplier = ascending ? 1 : -1;
    // Make it convoluted for the hell of it
    this.countriesReportsList = this.countriesReportsList.sort((a, b) => (a[key as keyof Report] > b[key as keyof Report]) ? multiplier : -multiplier);
  }

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FetcherService } from '../fetcher.service';
import { Report } from '../report.model';
import { DayOneData } from '../dayonedata';
import { WorldWeeklyTrend } from '../worldweeklytrend.model';

@Component({
  selector: 'app-country-page',
  templateUrl: './country-page.component.html',
  styleUrls: ['./country-page.component.css']
})
export class CountryPageComponent implements OnInit {

  countryCode: string;
  countryName: string;
  lastUpdated: string;
  report: Report;
  dayOne: DayOneData;
  weeklyTrend: WorldWeeklyTrend;

  constructor(
    private route: ActivatedRoute,
    private fetcher: FetcherService,
    private router: Router
  ) {
    this.countryCode = '';
    this.countryName = '';
    this.lastUpdated = '';
    this.report = new Report();
    this.weeklyTrend = new WorldWeeklyTrend();
    this.dayOne = {
      CountryCode: '',
      Country: '',
      DateObtained: '',
      FirstDate: '',
      DaysData: []
    };
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      // Check if the country we are trying to visit exists in the summary data.
      // If not, navigate back to the main page.
      this.fetcher.getSummaryReference().valueChanges().subscribe((res: any) => {
        if (res !== undefined) {
          // The DB will have the country list ready. Check if the Slug exists
          let slugFound : boolean = false;
          let countryList : [ { [k: string]: any } ] = res["Countries"];
          for (let countryData of countryList) {
            if (countryData["Slug"] == params["countrycode"]) {
              slugFound = true;
              // Also immediately fill up part of the data
              this.report = new Report(countryData);
              this.lastUpdated = res["DateObtained"];
              this.countryName = countryData["Country"];
              break;
            }
          }
          if (!slugFound) // No country with this name found. Navigate back to main global page.
            this.router.navigate(["global"]);
        }
      });
      // Update the coutry code for this page
      this.countryCode = params["countrycode"];

      // Fetch needed information to fill up the page
      this.setupData(this.countryCode);
    });
  }

  // Fetch all needed data from DB
  private setupData(countryCode: string): void {
    // Weekly trend
    this.fetcher.getWeeklyTrend(countryCode).valueChanges().subscribe((res: any) => {
      if(res !== undefined)
        this.weeklyTrend = new WorldWeeklyTrend(res);
    });

    // day one
    this.fetcher.getDayOne(countryCode).valueChanges().subscribe((res: any) => {
      if (res !== undefined)
        this.dayOne = res;
    });
  }

}

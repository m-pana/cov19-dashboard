import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { DailyNewData } from './weeklytrend'
import { News } from './news.model';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class FetcherService {

  private dataCollection : string = "cov19data";

  constructor(private http: HttpClient, private firestore : AngularFirestore) { }

  /** Convert Date object to a string of format YYYY-mm-dd.
  */
  formatDate(date: Date) {
    return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0");
  }

  /** Returns a reference to the summary document as an observable.
  * The document contains the summary of the current covid situation.
  * Internally, the method checks if the version uploaded on the DB is updated at today's date.
  * If not, triggers the call to the API and updates the database.
  *
  */
  getSummaryReference() {
    let sumDoc = this.firestore.collection(this.dataCollection).doc("summary");

    sumDoc.get().subscribe(doc => {
      let today : Date = new Date();
      let summary : FirebaseGlobalResponse = doc.data() as FirebaseGlobalResponse;
      // We refresh the db in two cases:
      // if the doc does not exists (will never happen unless the doc is manually deleted from firebase)
      // or if the doc was acquired in a date before today
      if (!doc.exists || summary["DateObtained"] < this.formatDate(today)) {
        console.log("Summary data obsolete or not found in DB.\nFilling the DB with new fresh summary data");

        let newSummaryRef = this.http.get("https://api.covid19api.com/summary");
        newSummaryRef.subscribe((res : any) => {
          console.log("Storing new summary in DB!");
          // Mark the document to remember that you acquired it in this day
          res["DateObtained"] = this.formatDate(new Date());
          console.log(res);
          this.firestore.collection(this.dataCollection).doc("summary").set(res);
          console.log("Written to DB.")
        });
      } else {
        console.log("Data in DB is already updated.")
      }
    });
    return sumDoc;
  }

  /** Returns a reference to the weekly trend document of the given country.
  * Internally, the method checks if the current document is updated, according to the current date.
  * If not, it fetches the data from the API and updates the stored values in the DB.
  */
  getWeeklyTrend(country: string) {
    let weeklyCollection = this.firestore.collection("weeklyTrend");
    let weeklyTrendDoc = weeklyCollection.doc(country);

    // When the doc arrives...
    weeklyTrendDoc.get().subscribe(doc => {
      let today : Date = new Date();
      let sevenDaysAgo : Date = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      // Create args with format ?from=2020-03-02T00:00:00Z&to=2020-12-10T00:00:00Z

      let callArgs : string = "?from=" + this.formatDate(sevenDaysAgo) + "T00:00:00Z&to=" + this.formatDate(today) + "T00:00:00Z";

      let trend : FirebaseGlobalResponse = doc.data() as FirebaseGlobalResponse;

      if (!doc.exists || trend["DateObtained"] < this.formatDate(today)) {
        console.log("Weekly trend for " + country + " obsolete or not found in DB.\nFilling the DB with new trend data");
        /* The API calls are different for world and for country, so we must check the string */
        if (country === "world") {
          /* For world weekly trend, we simply retrieve the last 7 entries of World WIP */
          let apiCall : string = "https://api.covid19api.com/world" + callArgs;
          console.log("calling " + apiCall);
          let newWorldTrend = this.http.get(apiCall);

          // When you get the trend, unpack it and store it in the DB
          newWorldTrend.subscribe((res : any) => {
            console.log("Inserting newly retrieved data about the world...");
            let toInsert = {
              DateObtained: this.formatDate(new Date()),
              /* Even though we have made a request for only 7 days, sometimes the API won't work and return ALL days from day 1. Thus, it is always necessary to take the array's last 7 elements, regardless */
              DaysData: res.slice(res.length-7, res.length),
              CountryCode: "world",
              Country: "World"
            };

            this.firestore.collection("weeklyTrend").doc("world").set(toInsert);
            console.log("Last 7 days world data written to DB.");
          });

        } else {
          let apiCall : string = "https://api.covid19api.com/total/dayone/country/" + country;
          let newCountryTrend = this.http.get(apiCall);

          newCountryTrend.subscribe((res: any) => {
            console.log("Inserting newly retrieved weekly data on country " + country);
            let toStoreInDB = this.formatWeeklyData(res, country);
            this.firestore.collection("weeklyTrend").doc(country).set(toStoreInDB);
            console.log("Last 7 days " + country + " data written to DB.");
          });

        }

      } else {
        console.log("Updated weekly trend for " + country + " already found in DB.");
      }


    });

    return weeklyTrendDoc;
  }

  getDayOne(countryCode: string) {
    let dayOneCollection = this.firestore.collection("dayOne");
    let dayOneDoc = dayOneCollection.doc(countryCode);

    // When the doc arrives...
    dayOneDoc.get().subscribe(doc => {
      let today: Date = new Date();
      let dayOneDataDB : FirebaseGlobalResponse = doc.data() as FirebaseGlobalResponse;

      if (!doc.exists || dayOneDataDB["DateObtained"] < this.formatDate(today)) {
        console.log("Day one data for " + countryCode + " obsolete or not found in DB.\nFilling DB with new day one data.");

        let apiCall : string;
        /* The API calls are different for world and other countries */
        if (countryCode == "world") {
          apiCall = "https://api.covid19api.com/world?from=2020-04-13T00:00:00Z&to=" + this.formatDate(today) + "T00:00:00Z";
        } else {
          apiCall = "https://api.covid19api.com/total/dayone/country/" + countryCode;
        }
        let newDayOne = this.http.get(apiCall);

          // When you get the day one, unpack it and store it in the DB
        newDayOne.subscribe((res: any) => {
          console.log("Inserting new day one data form " + countryCode + " in DB...");

          let toStoreInDB : FirebaseTrendToStore;
          if (countryCode == "world") {
            toStoreInDB = this.formatWorldDayOne(res);
          } else {
            toStoreInDB = this.formatCountryDayOne(res, countryCode);
          }

          this.firestore.collection("dayOne").doc(countryCode).set(toStoreInDB);
          console.log("Stored day one data for " + countryCode + ".");
        });
      } else {
        console.log("Already found zero day data of " + countryCode + " in DB.")
      }
    });

    return dayOneDoc;
  }

  /** Utility function to format the weekly data obtained from the API for a specific country.
  * Given the raw response of the API, returns the data with the format {Country, CountryCode, DaysData, DateObtained}.
  * Check readme for more information.
  */
  private formatWeeklyData(res: any, countryCode: string) : FirebaseTrendToStore {
    let last8days = res.slice(res.length-8, res.length); // Keep last 8 days
    let new7days: DailyNewData[] = [];
    for (let i=last8days.length-1; i >= 1; i--) { // Compute cumulative
      last8days[i]["Confirmed"] = last8days[i]["Confirmed"] - last8days[i-1]["Confirmed"];
      last8days[i]["Deaths"] = last8days[i]["Deaths"] - last8days[i-1]["Deaths"];
      last8days[i]["Recovered"] = last8days[i]["Recovered"] - last8days[i-1]["Recovered"];
      // Append new data as it is computed (but in reverse order)
      new7days.push({
        NewConfirmed: last8days[i]["Confirmed"],
        NewDeaths: last8days[i]["Deaths"],
        NewRecovered: last8days[i]["Recovered"]
      });
    }
    new7days = new7days.reverse(); // reverse so that data is in the right order

    // Construct new object ready to be stored in DB
    let toReturn : FirebaseTrendToStore = {
      CountryCode: countryCode,
      Country: res[0]["Country"],
      DateObtained: this.formatDate(new Date()), // date of today
      DaysData: new7days
    };

    return toReturn;
  }

  private formatWorldDayOne(res: any) : FirebaseDayOneToStore {
    let firstDate : Date = new Date("2020-04-13");
    // Iterate over all the obtained data. Sum along all 3 types of data to obtain cumulatives
    let daysData : {TotalConfirmed: number, TotalDeaths: number, TotalRecovered: number}[] = [];
    let currentTotConfirmed = 0;
    let currentTotDeaths = 0;
    let currentTotRecovered = 0;
    for (let i=0; i<res.length; i++) {
      currentTotConfirmed += res[i]["NewConfirmed"];
      currentTotDeaths += res[i]["NewDeaths"];
      currentTotRecovered += res[i]["NewRecovered"];
      daysData.push({
        TotalConfirmed: currentTotConfirmed,
        TotalDeaths: currentTotDeaths,
        TotalRecovered: currentTotRecovered
      });
    }

    // Occasionally, the API may return 0 NewConfirmed, NewDeaths and NewRecovered as first value of the array. In such case, we just skip the first day.
    if (daysData[0]["TotalConfirmed"] == 0 || daysData[0]["TotalRecovered"] == 0 || daysData[0]["TotalDeaths"] == 0) {
      firstDate.setDate(firstDate.getDate() + 1);
      daysData.shift(); // Removes first element of array
    }

    let toReturn : FirebaseDayOneToStore = {
      CountryCode: "world",
      Country: "World",
      DateObtained: this.formatDate(new Date()),
      FirstDate: this.formatDate(firstDate),
      DaysData: daysData,
    }
    return toReturn;
  }

  private formatCountryDayOne(res: any, countryCode: string) : FirebaseDayOneToStore {
    let firstDate = res[0]["Date"].substring(0, 10); // Keep only the format of the date AAAA-MM-DD
    // Iterate over all the obtained data. In this case, it is already cumulative.
    // Just keep the fields you are interested in.
    let daysData : {TotalConfirmed: number, TotalDeaths: number, TotalRecovered: number}[] = [];
    for (let i=0; i<res.length; i++) {
      daysData.push({
        TotalConfirmed: res[i]["Confirmed"],
        TotalDeaths: res[i]["Deaths"],
        TotalRecovered: res[i]["Recovered"]
      });
    }

    let toReturn : FirebaseDayOneToStore = {
      CountryCode: countryCode,
      Country: res[0]["Country"],
      DateObtained: this.formatDate(new Date()), // today's date
      FirstDate: firstDate,
      DaysData: daysData,
    }
    return toReturn;
  }

  /* Retrieve the document news from a specific country. */
  getNews(countryCode: string) {
    return this.firestore.collection("news").doc(countryCode).collection("newsList", ref => ref.orderBy('date', 'desc'));
  }

  /* Insert a specific news in the collection of a certain country */
  insertNews(news: News, countryCode: string, countryName: string) : void {
    // Retrieve the subcollection from the specific country document even if the country document does not exist yet
    let countryDoc = this.firestore.collection("news").doc(countryCode);
    let newsCollection = countryDoc.collection("newsList");
    // You can add the document to the subcollection even if the main document (e.g. france) does not exist yet
    newsCollection.add(news);
    // If the country document (e.g. france) did not exist, it will now exists in a "ghost" state.
    // It won't be visible from the queries until it has some other fields other than the subcollection
    // To solve this, we update the other existing fields.
    // If the document existed already, none of this will have effect
    countryDoc.set({
      countryCode: countryCode,
      countryName: countryName
    }, {merge: true});

  }

  /* Get the list of available countries from the DB.
  At each call, we also check from the COVID19 API if new countries are added and perhaps update the thing...*/
  getCountryList() {
    let countriesListDB = this.firestore.collection("countriesList", ref => ref.orderBy('countryName'));

    // Call the api to check if new countries have been added
    // (it's not like new countries will appear out of the blue, but you never know)
    // This is also useful to do the first insertion anyway
    // Or maybe if you delete some country by accident
    let countriesApiURL = "https://api.covid19api.com/countries";
    console.log("Performing check of available countries list from API...");
    let apiCountries = this.http.get(countriesApiURL);
    apiCountries.subscribe((res: any) => {
      res.forEach((countryInfo : any) => {
        // For each country info returned by the API, extract relevant information and package it in a suitable object
        let countryCode = countryInfo["Slug"];
        let countryName = countryInfo["Country"];
        let ISO2 = countryInfo["ISO2"];
        let toInsert = {
          countryCode: countryCode,
          countryName: countryName,
          ISO2: ISO2,
        };
        // Merge it in firebase. If the doc already existed, it will not be changed
        countriesListDB.doc(countryCode).set(toInsert, {merge: true});
      });
    });

    return countriesListDB;
  }

}

interface FirebaseGlobalResponse {
  Date: string,
  Global: any,
  Countries: any,
  DateObtained: string
}

interface FirebaseTrendToStore {
  CountryCode: string,
  Country: string,
  DateObtained: string,
  DaysData: any
}

interface FirebaseDayOneToStore {
  CountryCode: string,
  Country: string,
  DateObtained: string,
  FirstDate: string,
  DaysData: any
}

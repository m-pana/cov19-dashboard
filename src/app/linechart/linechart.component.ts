import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { DayOneData } from '../dayonedata';

@Component({
  selector: 'app-linechart',
  templateUrl: './linechart.component.html',
  styleUrls: ['./linechart.component.css']
})
export class LinechartComponent implements OnInit {

  @Input() dayOneData : DayOneData;

  public lineChartData: ChartDataSets[] = [
  { data: [], label: 'Confirmed' },
  { data: [], label: 'Deaths' },
  { data: [], label: 'Recovered' },
  ];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: ChartOptions  = {
    responsive: true,
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,0,0,0.3)',
    },
  ];
  public lineChartLegend = true;
  public lineChartType : ChartType = 'line';
  public lineChartPlugins = [];

  constructor() {
    this.dayOneData = {
          CountryCode: '',
          Country: '',
          DateObtained: '',
          FirstDate: '',
          DaysData: []
        }
    this.lineChartData = [
        { data: [], label: 'Deaths' },
        { data: [], label: 'Recovered' },
        { data: [], label: 'Confirmed' },
      ];
  }

  /** Convert Date object to a string of format YYYY-mm-dd.
  */
  private formatDate(date: Date) {
    return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0");
  }

  ngOnInit(): void { }

  ngOnChanges(changes : SimpleChanges): void {
    let newDayOne : DayOneData = changes["dayOneData"].currentValue;

    // Get the first date to do the labeling
    let currentDate : Date = new Date(newDayOne["FirstDate"]);
    let daysData = newDayOne["DaysData"];

    let data1 : number[] = [];
    let data2 : number[] = [];
    let data3 : number[] = [];
    let newLabels : Label[] = [];

    //Loop through the data and construct the arrays
    for (let i=0; i < daysData.length; i++) {
      data1.push(daysData[i]["TotalDeaths"]);
      data2.push(daysData[i]["TotalRecovered"]);
      data3.push(daysData[i]["TotalConfirmed"]);
      //this.lineChartData[0].data.push(daysData[i]["TotalConfirmed"]);
      //this.lineChartData[1].data.push(daysData[i]["TotalDeaths"]);
      //this.lineChartData[2].data.push(daysData[i]["TotalRecovered"]);
      //this.lineChartLabels.push(this.formatDate(currentDate));
      newLabels.push(this.formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.lineChartData[0]["data"] = data1;
    this.lineChartData[1]["data"] = data2;
    this.lineChartData[2]["data"] = data3;
    this.lineChartLabels = newLabels;

  }

}

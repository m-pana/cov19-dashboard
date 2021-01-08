import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { WeeklyTrend, DailyNewData } from '../weeklytrend';
import { WorldWeeklyTrend } from '../worldweeklytrend.model'

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.css']
})
export class BarchartComponent implements OnInit {

  @Input() weeklyData : WeeklyTrend;

  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: Label[];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[];

  constructor() {
    this.weeklyData = new WorldWeeklyTrend();

    this.barChartData = [
      { data: [], label: 'Daily deaths' },
      { data: [], label: 'Daily recovered' },
      { data: [], label: 'Daily new cases' }
    ];

    this.barChartLabels = ['None', 'None', 'None', 'None', 'None', 'None', 'None'];
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes : SimpleChanges): void {
    // Update barchart data
    let newWeeklyData : WeeklyTrend = changes["weeklyData"].currentValue;
    let daysData : DailyNewData[] = newWeeklyData["daysData"];
    // Fill days
    let dailyDeathsArray: number[] = [];
    let dailyRecoveredArray: number[] = [];
    let dailyConfirmedArray: number[] = [];

    for (let i=0; i < daysData.length; i++) {
      dailyDeathsArray.push(daysData[i].NewDeaths);
      dailyRecoveredArray.push(daysData[i].NewRecovered);
      dailyConfirmedArray.push(daysData[i].NewConfirmed);
    }
    this.barChartData[0]["data"] = dailyDeathsArray;
    this.barChartData[1]["data"] = dailyRecoveredArray;
    this.barChartData[2]["data"] = dailyConfirmedArray;
    // Fill labels
    let labelDate : Date = newWeeklyData.lastDate;
    for (let i=6; i>=0; i--) {
      let formattedDate: string = labelDate.getDate() + "-" + (labelDate.getMonth() + 1) + "-" + labelDate.getFullYear();
      this.barChartLabels[i] = formattedDate;
      labelDate.setDate(labelDate.getDate() - 1);
    }
  }

}

import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Report } from '../report.model';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';

@Component({
  selector: 'app-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.css']
})
export class PiechartComponent implements OnInit, OnChanges {

  @Input() report: Report;

  // Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = ['Dead cases', 'Recovered cases', 'Active cases'];
  public pieChartData: SingleDataSet = [33, 500, 100];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  constructor() {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
    this.report = new Report()
  }

  ngOnInit(): void {
  }

  // Whenever the input report changes, update the values
  ngOnChanges(changes: SimpleChanges): void {
    let newReport : Report = changes["report"].currentValue;
    this.pieChartData = [
      newReport["totalDeaths"],
      newReport["totalRecovered"],
      newReport["activeCases"]
    ];
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { Report } from '../report.model';
import { formatNumber } from '@angular/common';

@Component({
  selector: 'app-summary-table',
  templateUrl: './summary-table.component.html',
  styleUrls: ['./summary-table.component.css']
})
export class SummaryTableComponent implements OnInit {

  @Input() report: Report;

  constructor() {
    this.report = new Report();
  }

  ngOnInit(): void {
  }

}

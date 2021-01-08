import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { News } from '../news.model';
import { FetcherService } from '../fetcher.service';

@Component({
  selector: 'app-news-display',
  templateUrl: './news-display.component.html',
  styleUrls: ['./news-display.component.css']
})
export class NewsDisplayComponent implements OnInit {

  @Input() countryCode: string;
  @Input() countryName: string;
  countryNews: News[];

  constructor(private fetcher: FetcherService) {
    this.countryCode = '';
    this.countryName = '';
    this.countryNews = [];
  }

  newsEmpty(): boolean {
    return this.countryNews.length === 0;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes : SimpleChanges): void {
    // Retrieve the country name and code
    if (changes["countryCode"] !== undefined) { // Somewhat hackish check, but it works
      let newCountryCode: string = changes["countryCode"].currentValue;
      let newCountryName: string = changes["countryName"].currentValue;

      // If the country code is not null (i.e. we got a valid one), initiate the data retrieval from the DB
      if (newCountryCode !== '') {
        // We use snapshotChanges instead of get so that when new news are added by other users they are updated in real time
        this.fetcher.getNews(newCountryCode).snapshotChanges().subscribe(newsUpdate => {
          this.countryNews = newsUpdate.map(singleNews => singleNews.payload.doc.data()) as News[];
        });
      }
    }
  }

}

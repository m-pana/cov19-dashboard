import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GlobalComponent } from './global/global.component';
import { HttpClientModule } from '@angular/common/http';

 import { ChartsModule } from 'ng2-charts';
import { PiechartComponent } from './piechart/piechart.component';
import { BarchartComponent } from './barchart/barchart.component';
import { LinechartComponent } from './linechart/linechart.component';
import { CountryPageComponent } from './country-page/country-page.component';
import { SummaryTableComponent } from './summary-table/summary-table.component';
import { LoginComponent } from './login/login.component';
import { InsertNewsComponent } from './insert-news/insert-news.component';
import { NewsDisplayComponent } from './news-display/news-display.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    GlobalComponent,
    PiechartComponent,
    BarchartComponent,
    LinechartComponent,
    CountryPageComponent,
    SummaryTableComponent,
    LoginComponent,
    InsertNewsComponent,
    NewsDisplayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    ChartsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GlobalComponent } from './global/global.component';
import { CountryPageComponent } from './country-page/country-page.component';
import { InsertNewsComponent } from './insert-news/insert-news.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: "country/:countrycode", component: CountryPageComponent },
  { path: "global", component: GlobalComponent },
  { path: "insert-news", component: InsertNewsComponent, canActivate: [AuthGuard] },
  { path: "", pathMatch: "full", redirectTo: "global" },
  { path: "**", redirectTo: "global" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

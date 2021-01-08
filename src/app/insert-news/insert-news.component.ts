import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../login.service';
import { User } from '../user.model';
import { FetcherService } from '../fetcher.service';
import { Router } from '@angular/router';
import { News } from '../news.model';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ titlePopup }}</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p>{{ bodyPopup }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">Ok</button>
    </div>
  `
})
export class NgbdModalContent {

  @Input() titlePopup : string;
  @Input() bodyPopup : string;

  constructor(public activeModal: NgbActiveModal) {
    this.titlePopup = '';
    this.bodyPopup = '';
  }
}

@Component({
  selector: 'app-insert-news',
  templateUrl: './insert-news.component.html',
  styleUrls: ['./insert-news.component.css']
})
export class InsertNewsComponent implements OnInit {

  availableCountries: string[];
  user: User;
  userTemp: User | null;
  userIsAuthorized: boolean;
  countryNameToCode: Map<string, string>;
  countryNamesList: string[];

  // Fields of the news
  body: string;
  title: string;
  countryName: string;

  constructor(public loginHandler: LoginService, private fetcher: FetcherService, private router: Router, private modalService: NgbModal) {
    this.availableCountries = [];
    this.user = {
      uid: '',
      email: '',
      displayName: '',
    };
    this.userTemp = this.loginHandler.getUser();
    if (this.userTemp === null) {
      // This will never happen because of the guard.
      // It's a hackish way to get rid of the possible null value of the user.
      // Damn, angular is so picky...
      this.router.navigate(["global"]);
    } else {
      this.user = this.userTemp;
    }

    this.countryNameToCode = new Map<string, string>();
    // Insert the world mapping in the map manually (it's not stored in the DB)
    this.countryNameToCode.set("World", "world");
    this.userIsAuthorized = true;
    this.countryNamesList = ["World"];
    this.body = '';
    this.title = '';
    this.countryName = '';
  }

  ngOnInit(): void {
    // Retrieve available contries and map their name to their code
    this.fetcher.getCountryList().get().subscribe((collectionSnapshot: any) => {
      collectionSnapshot.docs.forEach((countryDoc: any) => {
        this.countryNameToCode.set(countryDoc.data()["countryName"], countryDoc.data()["countryCode"]);
        this.countryNamesList.push(countryDoc.data()["countryName"]);
      });
    });

    // Check if user is actually authorized to insert email.
    let dbUserDoc = this.loginHandler.retrieveDBUserData();
    if (dbUserDoc !== null)
      dbUserDoc.get().subscribe((res: any) => {
        this.userIsAuthorized = res.data()["authorizedNews"];
      });
  }

  submitNews() {
    // Again bypassing undefined controls...
    let mappedCountryCode = this.countryNameToCode.get(this.countryName);
    // Construct news object to insert in DB
    let newsToInsert : News = {
      title: this.title,
      body: this.body,
      countryName: this.countryName,
      countryCode: mappedCountryCode !== undefined ? mappedCountryCode : '',
      date: this.fetcher.formatDate(new Date()),
      uid: this.user.uid,
      email: this.user.email,
      username: this.user.displayName,
    }

    // Some logging just to visualize what we are doing
    console.log("Insering following news in DB:");

    // Finally insert in DB!
    this.fetcher.insertNews(newsToInsert, newsToInsert.countryCode, newsToInsert.countryName);

    // Reset all fields
    this.title = '';
    this.body = '';
    this.countryName = '';
  }

  open() {
    const modalRef = this.modalService.open(NgbdModalContent);
    let title : string;
    let body : string;
    if (this.title === '' || this.body === '' || this.countryName === '') {
      // Display error message in popup if at least one field is missing
      title = "Error.";
      body = "All fields of the form must be filled.";
    } else {
      title = "Thank you.";
      body = "Your submission was received.";
    }

    modalRef.componentInstance.titlePopup = title;
    modalRef.componentInstance.bodyPopup = body;
  }


}

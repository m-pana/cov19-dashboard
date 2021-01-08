import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { User } from './user.model';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private user: User | null; // user will be null when login has not been made

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore, private router: Router) {
    // Take the user from the local storage.
    // If the user is not locally stored, we set it as null
    // Subsequently, to check if the user is signed in, we'll check if 'this.user' is null.
    let localUserData = localStorage.getItem("user");
    if (localUserData !== null)
      this.user = JSON.parse(localUserData);
    else
      this.user = null;
  }

  async signInWithGoogle() {
    const credentials = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    // Run a check to see if login was successful (and make TypeScript happy)
    if (credentials === null
    || credentials.user === null
    || credentials.user.uid === null
    || credentials.user.email === null
    || credentials.user.displayName === null) {
      console.log("ERROR: could not login with Google.");
      return;
    }

    this.user = {
      uid: credentials.user.uid,
      email: credentials.user.email,
      displayName: credentials.user.displayName
    };

    let currentUser: User = {
      uid: '',
      email: '',
      displayName: '',
    };

    if (this.user !== null)
      currentUser = this.user;

    // Get user from db

    this.firestore.collection("users").doc(currentUser.uid).get().subscribe(doc => {
      // If it existed before, just merge it
      if (doc.exists) {
        console.log("User data already found in DB. Updating with new information...")
        this.firestore.collection("users").doc(currentUser.uid).set(this.user, {merge: true});
      } else {
        console.log("Welcome, new user!")
        // Poll the pre-auth addresses
        this.firestore.collection("pre_auth_emails", ref => ref.where('email', '==', currentUser.email)).snapshotChanges().subscribe((mailQuery: any) => {
          // when they arrive, decide if the user is pre-authorized or not based on the result
          let mails = mailQuery.map((mail: any) => mail.payload.doc.data())
          let auth: boolean;
          if (mails.length > 0) {
            console.log("New user was pre-authorized by admins. You are now a news contributor.")
            auth = true;
          } else {
            console.log("New user with default privileges.")
            auth = false;
          }
          let newUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            authorizedNews: auth
          }
          // Now write everything to db with correct auth
          this.firestore.collection("users").doc(currentUser.uid).set(newUser, {merge: true});
          console.log("Uploaded new user information in DB.")
        });
      } // End of "if user did not exist in db"
    });

    // Store user credentials in the database (merge and update his info if it existed already)
    //this.firestore.collection("users").doc(this.user.uid).set(this.user, {merge: true});
    // Store user credentials in local storage
    localStorage.setItem("user", JSON.stringify(this.user));
    // Initialize the 'authorized' field of the user, if it doesn't exist
    //this.initializeUserPermission(this.user);

  }

  signOut() {
    this.afAuth.signOut();
    localStorage.removeItem("user");
    this.user = null;
    // If the user is currently on the insert-news page, once logging out, it must be redirected to the homepage
    if (this.router.url === '/insert-news')
      this.router.navigate(["global"]);
  }

  userIsSignedIn() : boolean {
    return this.user !== null;
  }

  /* Gets the user data from the current storage */
  getUser() : User | null {
    return this.user;
  }

  /* Retrieve user data from the remote DB.
  Mainly used to check authorization of news. */
  retrieveDBUserData() {
    if (this.user !== null)
      return this.firestore.collection("users").doc(this.user.uid);
    else
      return null;
  }

  /* Retrieves the user document stored in the DB and checks if the 'authorized' field exists.
  If it doesn't, sets it to false. If it already exists, it's left as it is. */
  /* --- NOT USED ANYMORE
  private initializeUserPermission(user: User) {
    let uid = user.uid;
    let usersCollection = this.firestore.collection("users");
    let userDocumentSnapshot = usersCollection.doc(uid);

    userDocumentSnapshot.get().subscribe((userInfo: any) => {
      if (userInfo.data()["authorizedNews"] === undefined) {
        userDocumentSnapshot.set({authorizedNews: false}, {merge: true});
      }
    });
  }
  */
}

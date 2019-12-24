import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import * as $ from "jquery";
import { PhoneDetail } from './phone-detail.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private fb:FormBuilder, private http:HttpClient) { }
  readonly BaseURI = 'http://localhost:50360/api';
  readonly NodeURI = 'http://localhost:1234';

  phoneNumbers = [];
  conversations;
  selectedNumber = "";
  username = "";

  formModel = this.fb.group({
    UserName : ['', Validators.required],
    FullName : ['', Validators.required],
    Email : ['', [Validators.required,Validators.email]],
    Passwords : this.fb.group({
      Password : ['', [Validators.required, Validators.minLength(8)]],
      ConfirmPassword : ['', Validators.required],
    },{validator: this.comparePasswords })
  });

  comparePasswords(fb: FormGroup) {
    let confirmPswrdCtrl = fb.get('ConfirmPassword');
    //passwordMismatch
    //confirmPswrdCtrl.errors={passwordMismatch:true}
    if (confirmPswrdCtrl.errors == null || 'passwordMismatch' in confirmPswrdCtrl.errors) {
      if (fb.get('Password').value != confirmPswrdCtrl.value)
        confirmPswrdCtrl.setErrors({ passwordMismatch: true });
      else
        confirmPswrdCtrl.setErrors(null);
    }
  }

  register() {
    var body = {
      UserName : this.formModel.value.UserName,
      Email : this.formModel.value.Email,
      FullName : this.formModel.value.FullName,
      Password : this.formModel.value.Passwords.Password
    };

    return this.http.post(this.BaseURI + "/ApplicationUser/Register", body);
  }

  login(formData) {
    return this.http.post(this.BaseURI + '/ApplicationUser/Login', formData);
  }

  getUserProfile() {
    return this.http.get(this.BaseURI + '/UserProfile');
  }

  roleMatch(allowedRoles): boolean {
    var isMatch = false;
    var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
    var userRole = payLoad.role;
    allowedRoles.forEach(element => {
      if (userRole == element) {
        isMatch = true;
        return false;
      }
    });
    return isMatch;
  }
  
  private getHeaders(headersConfig?: object): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...headersConfig,
    });
  }

  requestUSNumber(username) {
    //Testing netcore example
    let reqObj: PhoneDetail;
    reqObj = {
      UserName: username,
      Country: 'US',
      PhoneSid: 'null',
      PhoneNumber: 'null',
      TimeCreated: 'null',
      TimeExpired: 'null'
    }
    return this.http.post(this.BaseURI + '/PhoneDetail/RequestUsNumber', reqObj);
  }

  requestCANumber(username) {
    //Testing netcore example
    let reqObj: PhoneDetail;
    reqObj = {
      UserName: username,
      Country: 'CAN',
      PhoneSid: 'null',
      PhoneNumber: 'null',
      TimeCreated: 'null',
      TimeExpired: 'null'
    }
    //return this.http.get(this.BaseURI + '/PhoneDetail/RequestUsNumber/' + username);
    return this.http.post(this.BaseURI + '/PhoneDetail/RequestCanNumber', reqObj);
  }

  getUsersNumbers(username) {
    return this.http.get(this.BaseURI + '/PhoneDetail/GetUserPhoneNumbers/' + username);
  }

  getUsersConversations(username, number) {
    number = number.substring(1, number.length)
    return this.http.get(this.BaseURI + '/ConversationDetails/GetUserConversations/' + username + "&" + number)
  }

  populateConversations() {
    console.log("Conversation Panel Loaded");
    if (this.selectedNumber != "") {
      this.getUsersConversations(this.username, this.selectedNumber).subscribe(
        res => {
          console.log(res);
          this.conversations = res;
        },
        err => {
          console.log(err);
        }
      );
    }
  }

}

import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import * as $ from "jquery";
import { PhoneDetail } from './phone-detail.model';
import { MessageDetail } from '../shared/message-detail.model';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private fb:FormBuilder, private http:HttpClient, private router:Router) { }
  readonly BaseURI = 'http://localhost:50360/api';
  readonly NodeURI = 'http://localhost:1234';

  phoneNumbers = [];
  conversations;
  selectedNumber = "";
  username = "";
  userPhoneNumbers;
  userSelectedConversation;
  userDetails;

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

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('conversation');
    localStorage.removeItem('selectedNumber');
    this.router.navigate(['/user/login']);
  }

  onLogin() {
    this.router.navigate(['/user/login'])
  }

  onRegister() {
    this.router.navigate(['/user/registration'])
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
    number = number.substring(1, number.length);
    //return this.http.get(this.BaseURI + '/ConversationDetails/GetUserConversations/' + username + "&" + number)
    return this.http.get(this.BaseURI + '/PhoneDetail/UpdatePhoneConversations/' + username + "&" + number)
  }

  populateConversations(username) {
    console.log("Conversation Panel Loaded");
    var selectedNumber = localStorage.getItem("selectedNumber");
    console.log(selectedNumber);
    console.log("Username in popcon:" + username);
    if (selectedNumber != null) {
      this.getUsersConversations(username, selectedNumber).subscribe(
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

  updatePhoneConversations(username, selectedNumber) {
    selectedNumber = selectedNumber.substring(1, selectedNumber.length);
    return this.http.get(this.BaseURI + '/PhoneDetail/UpdatePhoneConversations/' + username + "&" + selectedNumber);
  }

  getUserConversationMessages(username, selectedNumber, toPhoneNumber) {
    var number = (toPhoneNumber).substring(1, (toPhoneNumber).length);
    var usernumber = (selectedNumber).substring(1, (selectedNumber).length);
    return this.http.get(this.BaseURI + '/MessageDetails/GetUserConversationMessages/' + username + "&" + number + "&" + usernumber);
  }

  sendMessage(body, fromPhoneNumber, toPhoneNumber) {
    let reqObj: MessageDetail;
    reqObj = {
      MessageSid: 'null',
      Body: body,
      Time: 'null',
      Direction: 'null',
      FromPhoneNumber: fromPhoneNumber,  
      ToPhoneNumber: toPhoneNumber
    }
    console.log("Finally sending message");
    console.log(reqObj);
    return this.http.post(this.BaseURI + '/MessageDetails/SendMessage', reqObj);
  }

  getConversationMessages(username, fromPhoneNumber, toPhoneNumber) {
    var fromnumber = (fromPhoneNumber).substring(1, (fromPhoneNumber).length);
    var tonumber = (toPhoneNumber).substring(1, (toPhoneNumber).length);

    return this.http.get(this.BaseURI + '/PhoneDetail/GetConversationMessages/' + username + "&" + fromnumber + "&" + tonumber);
  }

}

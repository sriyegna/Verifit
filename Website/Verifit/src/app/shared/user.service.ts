import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import * as $ from "jquery";
import { PhoneDetail } from './phone-detail.model';
import { MessageDetail } from '../shared/message-detail.model';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ConversationDetail } from './conversation-detail.model';
import { ContactDetail } from './contact-detail.model';
import * as uuid from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private fb:FormBuilder, private http:HttpClient, private router:Router) { }
  readonly BaseURI = 'https://api.multiph.one:4440/api';
  //readonly BaseURI = 'http://45.77.155.37/api';
  
  phoneNumbers = [];
  contactList = [];
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

  accountModel = this.fb.group({
    UserName : ['', Validators.required],
    FullName : ['', Validators.required],
    Email : ['', [Validators.required,Validators.email]],
    Passwords : this.fb.group({
      Password : ['', [Validators.minLength(8)]],
      ConfirmPassword : [''],
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
    this.userDetails = null;
  }

  onLogin() {
    this.router.navigate(['/user/login'])
  }

  onRegister() {
    this.router.navigate(['/user/registration'])
  }

  getUserProfile() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    };
    return this.http.get(this.BaseURI + '/UserProfile/GetUserProfile');
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
      TimeExpired: 'null',
      ForwardingNumber: '-'
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
      TimeExpired: 'null',
      ForwardingNumber: '-'
    }
    //return this.http.get(this.BaseURI + '/PhoneDetail/RequestUsNumber/' + username);
    return this.http.post(this.BaseURI + '/PhoneDetail/RequestCanNumber', reqObj);
  }

  getUsersNumbers(username) {
    return this.http.get(this.BaseURI + '/PhoneDetail/GetUserPhoneNumbers/' + username);
  }

  getUsersConversations(number) {
    number = number.substring(1, number.length);
    //return this.http.get(this.BaseURI + '/ConversationDetails/GetUserConversations/' + username + "&" + number)
    return this.http.get(this.BaseURI + '/PhoneDetail/UpdatePhoneConversations/' + number)
  }

  populateConversations() {
    var selectedNumber = localStorage.getItem("selectedNumber");
    if (selectedNumber != null) {
      this.getUsersConversations(selectedNumber).subscribe(
        res => {
          this.conversations = res;
          this.determineConversationContacts();
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  determineConversationContacts() {
    for (let conversation of this.conversations) {
      for (let contact of this.contactList) {
        if (conversation.toPhoneNumber == contact.phoneNumber) {
          conversation.ContactName = contact.contactName;
        }
      }
    }
  }

  // updatePhoneConversations(username, selectedNumber) {
  //   selectedNumber = selectedNumber.substring(1, selectedNumber.length);
  //   return this.http.get(this.BaseURI + '/PhoneDetail/UpdatePhoneConversations/' + selectedNumber);
  // }

  getUserConversationMessages(selectedNumber, toPhoneNumber) {
    var number = (toPhoneNumber).substring(1, (toPhoneNumber).length);
    var usernumber = (selectedNumber).substring(1, (selectedNumber).length);
    return this.http.get(this.BaseURI + '/MessageDetails/GetUserConversationMessages/' + number + "&" + usernumber);
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
    return this.http.post(this.BaseURI + '/MessageDetails/SendMessage', reqObj);
  }

  getConversationMessages(fromPhoneNumber, toPhoneNumber) {
    var fromnumber = (fromPhoneNumber).substring(1, (fromPhoneNumber).length);
    var tonumber = (toPhoneNumber).substring(1, (toPhoneNumber).length);

    return this.http.get(this.BaseURI + '/PhoneDetail/GetConversationMessages/' + fromnumber + "&" + tonumber);
  }
  
  deleteConversation(conversation) {
    let reqObj: ConversationDetail;
    reqObj = {
      ConversationId: conversation.ConversationId,
      ConversationName: 'null',
      ContactName: 'null',
      FromPhoneNumber: conversation.FromPhoneNumber,
      ToPhoneNumber: conversation.ToPhoneNumber,
      LastMessage: conversation.LastMessage,
      LastMessageTime: conversation.LastMessageTime
    };
    return this.http.post(this.BaseURI + '/ConversationDetails/DeleteConversation', reqObj);
  }

  renameConversation(conversation) {
    let reqObj: ConversationDetail;
    reqObj = {
      ConversationId: conversation.ConversationId,
      ConversationName: conversation.ConversationName,
      ContactName: 'null',
      FromPhoneNumber: conversation.FromPhoneNumber,
      ToPhoneNumber: conversation.ToPhoneNumber,
      LastMessage: conversation.LastMessage,
      LastMessageTime: conversation.LastMessageTime
    };
    return this.http.post(this.BaseURI + '/ConversationDetails/RenameConversation', reqObj);
  }

  deleteMessage(message) {
    let reqObj: MessageDetail;
    reqObj = {
      MessageSid: message.MessageSid,
      Body: 'null',
      Time: 'null',
      Direction: 'null',
      FromPhoneNumber: 'null',  
      ToPhoneNumber: 'null'
    }
    return this.http.post(this.BaseURI + '/MessageDetails/DeleteMessage', reqObj);
  }

  changeForwardingNumber(phone, newForwardingPhone) {
    let reqObj: PhoneDetail;
    reqObj = {
      UserName: 'null',
      PhoneSid: phone.phoneSid,
      PhoneNumber: 'null',
      TimeCreated: 'null',
      TimeExpired: 'null',
      Country: 'null',
      ForwardingNumber: newForwardingPhone
    }
    return this.http.post(this.BaseURI + '/PhoneDetail/ChangeForwardingNumber', reqObj);
  }

  releaseNumber(phone) {
    let reqObj: PhoneDetail;
    reqObj = {
      UserName: 'null',
      PhoneSid: phone.phoneSid,
      PhoneNumber: 'null',
      TimeCreated: 'null',
      TimeExpired: 'null',
      Country: 'null',
      ForwardingNumber: 'null'
    }
    return this.http.post(this.BaseURI + "/PhoneDetail/ReleaseNumber", reqObj);
  }

  getUsersContacts() {
    return this.http.get(this.BaseURI + '/ContactDetails/GetUserContacts/' + this.userDetails.userName);
  }

  changeContactName(contact, newContactName) {
    let reqObj: ContactDetail;
    reqObj = {
      ContactId: contact.contactId,
      UserName: 'null',
      ContactName: newContactName,
      PhoneNumber: 'null'
    }
    return this.http.post(this.BaseURI + "/ContactDetails/ChangeContactName", reqObj);
  }

  changeContactNumber(contact, newContactNumber) {
    let reqObj: ContactDetail;
    reqObj = {
      ContactId: contact.contactId,
      UserName: 'null',
      ContactName: 'null',
      PhoneNumber: newContactNumber
    }
    return this.http.post(this.BaseURI + "/ContactDetails/ChangeContactNumber", reqObj);
  }

  deleteContact(contact) {
    let reqObj: ContactDetail;
    reqObj = {
      ContactId: contact.contactId,
      UserName: 'null',
      ContactName: 'null',
      PhoneNumber: 'null'
    }
    return this.http.post(this.BaseURI + "/ContactDetails/DeleteContact", reqObj);
  }
  
  addContact(addContactName, addContactNumber) {
    let reqObj: ContactDetail;
    reqObj = {
      ContactId: uuid.v4(),
      UserName: this.userDetails.userName,
      ContactName: addContactName,
      PhoneNumber: addContactNumber
    }
    return this.http.post(this.BaseURI + "/ContactDetails/AddContact", reqObj);
  }

  modifyAccount() {
    var body = {
      OldUserName : this.userDetails.userName,
      UserName : this.accountModel.value.UserName,
      Email : this.accountModel.value.Email,
      FullName : this.accountModel.value.FullName,
      Password : this.accountModel.value.Passwords.Password,
      Role : this.userDetails.role
    };

    return this.http.post(this.BaseURI + "/ApplicationUser/ChangeAccount", body);
  }

  determineImage(country) {
    if (country == "CAN") {
      return false;
    }
    return true;
  }

}

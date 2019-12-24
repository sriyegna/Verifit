import { Component, OnInit, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { PhoneDetail } from '../shared/phone-detail.model';

@Component({
  selector: 'app-bronze-panel',
  templateUrl: './bronze-panel.component.html',
  styles: []
})
export class BronzePanelComponent implements OnInit {

  userDetails;
  constructor(private router:Router, private service:UserService) { }

  getPhoneNumberList(string) {
    this.service.getUsersNumbers(this.userDetails.UserName).subscribe(
      res => {
        console.log(res);
        this.service.phoneNumbers = [];
        let array = res as Array<PhoneDetail>;
        for (let element of array) {
          this.service.phoneNumbers.push(element.PhoneNumber);
        }
        if (string == "init" && this.service.phoneNumbers.length > 0) {
          this.service.selectedNumber = this.service.phoneNumbers[0];
        }
        console.log(this.service.selectedNumber);
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnInit() {
    this.service.getUserProfile().subscribe(
      res => {
        this.userDetails = res;
        var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
        this.userDetails.role = payLoad.role;
        this.service.username = this.userDetails.UserName;
        this.getPhoneNumberList("init");
      },
      err => {
        console.log(err);
      }
    );
  }

  requestUSNumber() {
    this.service.requestUSNumber(this.userDetails.UserName).subscribe(
      res => {
        console.log(res);
        this.getPhoneNumberList("");
      },
      err => {
        console.log(err);
      }
    );
  }

  requestCANumber() {
    this.service.requestCANumber(this.userDetails.UserName).subscribe(
      res => {
        console.log("reqCanum");
        console.log(res);
        console.log("reqCanum");
        this.getPhoneNumberList("");
      },
      err => {
        console.log(err);
      }
    );
  }

  // getuserUSNumbers() {
  //   this.service.getuserUSNumbers(this.userDetails.userName.toLowerCase()).subscribe(
  //     res => {
      
  //     },
  //     err => {
  //       console.log(err);
  //     }
  //   );
  // }

  callFn(phoneNumber) {
    console.log(phoneNumber);
    this.service.selectedNumber = phoneNumber;
    this.service.populateConversations();
  }

  

}

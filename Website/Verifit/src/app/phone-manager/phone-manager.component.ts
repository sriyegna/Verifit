import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { PhoneDetail } from '../shared/phone-detail.model';

@Component({
  selector: 'app-phone-manager',
  templateUrl: './phone-manager.component.html',
  styleUrls: ['./phone-manager.component.css']
})
export class PhoneManagerComponent implements OnInit {

  userDetails;

  constructor(public service:UserService) { }

  ngOnInit() {
    this.service.getUserProfile().subscribe(
      res => {
        this.userDetails = res;
        var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
        this.userDetails.role = payLoad.role;
        this.service.username = this.userDetails.userName;
        this.service.userDetails = this.userDetails;

        this.getPhoneNumberList("");
      },
      err => {
        console.log(err);
      }
    );
  }

  getPhoneNumberList(string) {
    this.service.getUsersNumbers(this.userDetails.userName).subscribe(
      res => {
        this.service.userPhoneNumbers = res;
        console.log("Outputting phone numbers");
        console.log(res);
        this.service.phoneNumbers = [];
        let array = res as Array<PhoneDetail>;
        for (let element of array) {
          this.service.phoneNumbers.push(element.PhoneNumber);
        }
        console.log(this.service.selectedNumber);
      },
      err => {
        console.log(err);
      
      }
    );
  }


  releaseNumber(phone) {
    
  }

  

}

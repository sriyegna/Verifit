import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-bronze-panel',
  templateUrl: './bronze-panel.component.html',
  styles: []
})
export class BronzePanelComponent implements OnInit {

  userDetails;
  constructor(private router:Router, private service:UserService) { }

  ngOnInit() {
    this.service.getUserProfile().subscribe(
      res => {
        this.userDetails = res;
        var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
        this.userDetails.role = payLoad.role;
      },
      err => {
        console.log(err);
      }
    );
  }

  requestUSNumber() {
    this.service.requestUSNumber(this.userDetails.userName.toLowerCase()).subscribe(
      res => {
        console.log("response");
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
  }

  requestCANumber() {
    this.service.requestCANumber(this.userDetails.userName.toLowerCase()).subscribe(
      res => {
        console.log("response");
        console.log(res);
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

}

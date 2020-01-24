import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styles: []
})
export class FrontpageComponent implements OnInit {

  userDetails;

  constructor(private router:Router, private service:UserService) { }

  ngOnInit() {
    this.service.getUserProfile().subscribe(
      res => {
        this.userDetails = res;
        var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
        this.userDetails.role = payLoad.role;
        this.service.username = this.userDetails.UserName;
        this.service.userDetails = this.userDetails;

      },
      err => {
        console.log(err);
      }
    );
  }

}

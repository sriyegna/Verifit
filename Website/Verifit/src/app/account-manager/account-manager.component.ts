import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-account-manager',
  templateUrl: './account-manager.component.html',
  styles: []
})
export class AccountManagerComponent implements OnInit {

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
        this.populateAccountModel(this.service.accountModel);
      },
      err => {
        console.log(err);
      }
    );
  }

  populateAccountModel(fb: FormGroup) {
    fb.controls['UserName'].setValue(this.service.userDetails.userName);
    fb.controls['FullName'].setValue(this.service.userDetails.fullName);
    fb.controls['Email'].setValue(this.service.userDetails.email);
    //this.form.controls['dept'].setValue(selected.id);

  }

  onSubmit() {
    console.log(this.service.accountModel);
  }

}

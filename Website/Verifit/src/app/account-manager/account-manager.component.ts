import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-account-manager',
  templateUrl: './account-manager.component.html',
  styles: []
})
export class AccountManagerComponent implements OnInit {

  userDetails;

  constructor(public service:UserService, private toastr: ToastrService) { }

  ngOnInit() {
    this.getUserProfile();
  }

  getUserProfile() {
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
    this.service.modifyAccount().subscribe(
      (res:any) => {
        console.log(res);
        if (res.succeeded) {
          this.service.accountModel.reset();
          this.getUserProfile();
          this.toastr.success("Account modified!", "Modification Successful");
        }
        else {
          res.errors.forEach(element => {
            switch (element.code) {
              case 'DuplicateUserName':
                this.toastr.error(element.description, "Modification Failed");
                break;
              case 'PasswordRequiresNonAlphanumeric':
                this.toastr.error("Password requires Non Alphanumeric character", "Modification Failed");
                break;
              case 'PasswordRequiresDigit':
                this.toastr.error("Password requires digit", "Modification Failed");
                break;
              case 'PasswordRequiresUpper':
                this.toastr.error("Password requires uppercase character", "Modification Failed");
                break;
              case 'PasswordRequiresLower':
                this.toastr.error("Password requires lowercase character", "Modification Failed");
                break;
              default:
                this.toastr.error("Error: " + element.code, "Modification Failed");
                break;
            }            
          });
        }
      },
      err => {
        console.log(err);
      }
    );
  }

}

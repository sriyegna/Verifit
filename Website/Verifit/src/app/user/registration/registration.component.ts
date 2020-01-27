import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styles: []
})
export class RegistrationComponent implements OnInit {

  constructor(public service: UserService, private toastr: ToastrService) { }

  ngOnInit() {
    this.service.formModel.reset();
  }

  onSubmit() {
    this.service.register().subscribe(
      (res:any) => {
        console.log(res);
        if (res.Succeeded) {
          this.service.formModel.reset();
          this.toastr.success("New user created!", "Registration Successful");
        }
        else {
          res.errors.forEach(element => {
            switch (element.code) {
              case 'DuplicateUserName':
                this.toastr.error(element.description, "Registration Failed");
                break;
              case 'PasswordRequiresNonAlphanumeric':
                this.toastr.error("Password requires Non Alphanumeric character", "Registration Failed");
                break;
              case 'PasswordRequiresDigit':
                this.toastr.error("Password requires digit", "Registration Failed");
                break;
              case 'PasswordRequiresUpper':
                this.toastr.error("Password requires uppercase character", "Registration Failed");
                break;
              case 'PasswordRequiresLower':
                this.toastr.error("Password requires lowercase character", "Registration Failed");
                break;
              default:
                this.toastr.error("Error!", "Registration Failed");
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

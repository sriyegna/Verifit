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

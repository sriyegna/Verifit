import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/shared/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  formModel = {
    UserName : '',
    Password: ''
  }


  constructor(private service:UserService, private router:Router, private toastr:ToastrService) { }

  ngOnInit() {
    if (localStorage.getItem('token') != null) {
      this.router.navigateByUrl('/home');
    }
  }

  onSubmit(form:NgForm) {
    this.service.login(form.value).subscribe(
      (res:any) => {
        localStorage.setItem('token', res.token);
        this.router.navigateByUrl('/home')
      },
      err => {
        if(err.status == 400) {
          this.toastr.error('Incorrect Username or Password.', 'Authenticaion Failed.');
        }
        else {
          console.log(err);
          this.toastr.error('Authentication Failed.', 'Authenticaion Failed.');
        }
      }
    );
  }

}

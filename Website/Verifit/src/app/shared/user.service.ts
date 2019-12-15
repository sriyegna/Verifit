import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private fb:FormBuilder, private http:HttpClient) { }
  readonly BaseURI = 'http://localhost:50360/api';
  readonly NodeURI = 'http://localhost:1234';


  formModel = this.fb.group({
    UserName : ['', Validators.required],
    FullName : ['', Validators.required],
    Email : ['', [Validators.required,Validators.email]],
    Passwords : this.fb.group({
      Password : ['', [Validators.required, Validators.minLength(8)]],
      ConfirmPassword : ['', Validators.required],
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

  getUserProfile() {
    return this.http.get(this.BaseURI + '/UserProfile');
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

  requestUSNumber(username) {
    return this.http
    .post(this.NodeURI + '/purchasenumberus', {
      params: new HttpParams().set('username', username),
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  requestCANumber(username) {
    console.log("reqcanum " + username);
    // return this.http
    // .post(this.NodeURI + '/purchasenumberca', {
    //   params: new HttpParams().set('username', username),
    //   headers: new HttpHeaders().set('Content-Type', 'application/json')
    // });
    return this.http.post(this.NodeURI + '/purchasenumberca', {data: {test: "123"}});
  }

  getuserUSNumbers(username) {
    //return this.http.
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styles: []
})
export class UserComponent implements OnInit {

  constructor(private router:Router, private service:UserService) { }

  ngOnInit() {
  }


}

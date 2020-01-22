import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-phone-manager',
  templateUrl: './phone-manager.component.html',
  styleUrls: ['./phone-manager.component.css']
})
export class PhoneManagerComponent implements OnInit {

  constructor(public service:UserService) { }

  ngOnInit() {
  }

}

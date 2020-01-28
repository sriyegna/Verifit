import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-releasetrigger',
  templateUrl: './releasetrigger.component.html',
  styleUrls: ['./releasetrigger.component.css']
})
export class ReleasetriggerComponent implements OnInit {

  constructor(private service:UserService) { }

  ngOnInit() {
    this.service.dailyReleaseTrigger().subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err)
      }
    );
  }

}

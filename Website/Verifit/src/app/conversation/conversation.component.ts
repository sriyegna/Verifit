import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styles: []
})
export class ConversationComponent implements OnInit {

  messageList;
  userSelectedConversation;
  userDetails;
  messageBody: string = '';

  constructor(private service:UserService, private router:Router) { }

  ngOnInit() {
    this.service.getUserProfile().subscribe(
      res => {
        this.userDetails = res;
        var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
        this.userDetails.role = payLoad.role;
        this.service.username = this.userDetails.UserName;

        var conversation = JSON.parse(localStorage.getItem("conversation"));

        this.service.getConversationMessages(this.userDetails.UserName, conversation.FromPhoneNumber, conversation.ToPhoneNumber).subscribe(
          res => {
            console.log("output of getconversationmessages");
            console.log(res);

            this.service.getUserConversationMessages(this.userDetails.UserName, conversation.FromPhoneNumber, conversation.ToPhoneNumber).subscribe(
              res => {
                console.log("Output message details");
                console.log(res);
                this.messageList = res;
                //this.router.navigateByUrl("#endOfMessages");
              },
              err => {
                console.log(err);
              }
            );


          },
          err => {
            console.log(err);
          }
        )

      },
      err => {
        console.log(err);
      }
    );    
  }
  
  sendMessage() {
    console.log(this.messageBody)
    var conversation = JSON.parse(localStorage.getItem("conversation"));
    this.service.sendMessage(this.messageBody, conversation.FromPhoneNumber, conversation.ToPhoneNumber, this.userDetails.UserName).subscribe(
      res => {
        console.log("Succesful sending");
        console.log(res);

        this.service.getUserConversationMessages(this.userDetails.UserName, conversation.FromPhoneNumber, conversation.ToPhoneNumber).subscribe(
          res => {
            console.log("Output message details");
            console.log(res);
            this.messageList = res;
            this.messageBody = "";
            //this.router.navigateByUrl("#endOfMessages");
          },
          err => {
            console.log(err);
          }
        );
      },
      err => {
        console.log(err);
      }
    );
  }

  classDirection(message) {
    //console.log("Class Direction");
    //console.log(message);
    if (message.Direction == 'inbound') {
      return 'darker';
    }
  }

}

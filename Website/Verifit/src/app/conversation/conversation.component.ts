import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';
import { PageScrollService, PageScrollInstance, EasingLogic } from 'ngx-page-scroll-core';
import { DOCUMENT } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styles: []
})
export class ConversationComponent implements OnInit {

  @ViewChild('basicContainer', {static: false})
  public basicContainer: ElementRef;
  
  messageList;
  userSelectedConversation;
  userDetails;
  messageBody: string = '';

  constructor(private service:UserService, private router:Router, private pageScrollService: PageScrollService, @Inject(DOCUMENT) private document: any) { }

  private delay(ms: number)
  {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ngOnInit() {
    this.service.getUserProfile().subscribe(
      res => {
        this.userDetails = res;
        var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
        this.userDetails.role = payLoad.role;
        this.service.username = this.userDetails.userName;
        this.service.userDetails = this.userDetails;

        var conversation = JSON.parse(localStorage.getItem("conversation"));

        this.service.getConversationMessages(conversation.fromPhoneNumber, conversation.toPhoneNumber).subscribe(
          res => {
            this.service.getUserConversationMessages(conversation.fromPhoneNumber, conversation.toPhoneNumber).subscribe(
              res => {
                this.messageList = res;
                this.scrollTo();
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
      },
      err => {
        console.log(err);
      }
    );    
  }
  
  sendMessage() {
    var conversation = JSON.parse(localStorage.getItem("conversation"));
    this.service.sendMessage(this.messageBody, conversation.fromPhoneNumber, conversation.toPhoneNumber).subscribe(
      res => {
        this.service.getUserConversationMessages(conversation.fromPhoneNumber, conversation.toPhoneNumber).subscribe(
          res => {
            this.messageList = res;
            this.messageBody = "";
            this.scrollTo();
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
    if (message.direction == 'inbound') {
      return 'darker';
    }
  }

  private async scrollTo() {
    await this.delay(500);
    this.pageScrollService.scroll({
      document: this.document,
      scrollTarget: "#sendDiv",
      duration: 200
    });
  }

  deleteMessage(message, e) {
    //e.stopPropagation();
    this.service.deleteMessage(message).subscribe(
      res => {
        var conversation = JSON.parse(localStorage.getItem("conversation"));
        this.service.getUserConversationMessages(conversation.fromPhoneNumber, conversation.toPhoneNumber).subscribe(
          res => {
            this.messageList = res;
            this.messageBody = "";
            this.scrollTo();
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
  }

}

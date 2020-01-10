import { Component, OnInit, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { PhoneDetail } from '../shared/phone-detail.model';
import { ConversationComponent } from '../conversation/conversation.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-bronze-panel',
  templateUrl: './bronze-panel.component.html',
  styles: []
})
export class BronzePanelComponent implements OnInit {

  userDetails;
  selectedNumber = "Phone Number";
  recipientPhone = "";
  messageBody = "";
  constructor(private router:Router, private service:UserService, private conversation:ConversationComponent) { }

  getPhoneNumberList(string) {
    this.service.getUsersNumbers(this.userDetails.UserName).subscribe(
      res => {
        this.service.userPhoneNumbers = res;
        console.log("Outputting phone numbers");
        console.log(res);
        this.service.phoneNumbers = [];
        let array = res as Array<PhoneDetail>;
        for (let element of array) {
          this.service.phoneNumbers.push(element.PhoneNumber);
        }
        if (string == "init" && this.service.phoneNumbers.length > 0) {
          this.service.selectedNumber = this.service.phoneNumbers[0];
        }
        console.log(this.service.selectedNumber);
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnInit() {
    this.service.getUserProfile().subscribe(
      res => {
        this.userDetails = res;
        var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
        this.userDetails.role = payLoad.role;
        this.service.username = this.userDetails.UserName;
        this.service.userDetails = this.userDetails;

        this.getPhoneNumberList("init");

        if (localStorage.getItem("selectedNumber") != null) {
          console.log("Getting " + localStorage.getItem("selectedNumber"));
          this.selectedNumber = localStorage.getItem("selectedNumber");
          this.service.populateConversations()
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  requestUSNumber() {
    this.service.requestUSNumber(this.userDetails.UserName).subscribe(
      res => {
        console.log(res);
        this.getPhoneNumberList("");
      },
      err => {
        console.log(err);
      }
    );
  }

  requestCANumber() {
    this.service.requestCANumber(this.userDetails.UserName).subscribe(
      res => {
        console.log("reqCanum");
        console.log(res);
        console.log("reqCanum");
        this.getPhoneNumberList("");
      },
      err => {
        console.log(err);
      }
    );
  }


  callFn(phoneNumber) {
    console.log("Saving" + phoneNumber);
    localStorage.setItem("selectedNumber", phoneNumber);
    this.service.selectedNumber = phoneNumber;
    this.selectedNumber = phoneNumber;
    this.service.populateConversations();
  }

  clickConversation(conversation) {
    console.log(conversation);
    this.service.userSelectedConversation = conversation;
    this.conversation.userSelectedConversation = conversation;
    localStorage.setItem("conversation", JSON.stringify(conversation));
    this.router.navigate(['/conversation']);
  }

  sendMessage() {
    console.log(this.messageBody)
    this.service.sendMessage(this.messageBody, this.selectedNumber, this.recipientPhone).subscribe(
      res => {
        console.log("Return from new sendmessage");
        console.log(res);
        this.messageBody = "";
        this.recipientPhone = "";
        //let element = document.getElementById('exampleModal');
        //element.className = "modal fade close";
        
        
        //***Update conversations after message is sent

      }
    );
  }

  deleteConversation(conversation, e) {
    console.log("Outputting conversation");
    console.log(conversation);
    e.stopPropagation();
    this.service.deleteConversation(conversation).subscribe(
      res => {
        this.service.populateConversations()
      },
      err => {
        console.log(err);
      }
    )
  }

  dontPropogate(e) {
    e.stopPropagation();
  }
  

}

import { Component, OnInit, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { PhoneDetail } from '../shared/phone-detail.model';
import { ConversationComponent } from '../conversation/conversation.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ContactDetail } from '../shared/contact-detail.model';

@Component({
  selector: 'app-bronze-panel',
  templateUrl: './bronze-panel.component.html',
  styles: []
})
export class BronzePanelComponent implements OnInit {

  userDetails;
  selectedNumber = "Phone Number";
  selectedContact;
  recipientPhone = "";
  messageBody = "";
  closeResult: string;
  newNameField: string;

  constructor(private router:Router, public service:UserService, private conversation:ConversationComponent, private modalService: NgbModal) { }

  ngOnInit() {
    this.service.getUserProfile().subscribe(
      res => {
        this.userDetails = res;
        var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
        this.userDetails.role = payLoad.role;
        this.service.username = this.userDetails.userName;
        this.service.userDetails = this.userDetails;

        this.getPhoneNumberList("init");
        this.getContactList();

        if (localStorage.getItem("selectedNumber") != null) {
          this.selectedNumber = localStorage.getItem("selectedNumber");
          this.service.populateConversations()
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  open(content, e) {
    e.stopPropagation();
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  
  rename(content, e) {
    e.stopPropagation();
    this.modalService.open(content, {ariaLabelledBy: 'modal-rename'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  getPhoneNumberList(string) {
    this.service.getUsersNumbers(this.userDetails.userName).subscribe(
      res => {
        this.service.userPhoneNumbers = res;
        this.service.phoneNumbers = [];
        let array = res as Array<PhoneDetail>;
        for (let element of array) {
          this.service.phoneNumbers.push(element.PhoneNumber);
        }
        if (string == "init" && this.service.phoneNumbers.length > 0) {
          this.service.selectedNumber = this.service.phoneNumbers[0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  requestUSNumber() {
    this.service.requestUSNumber(this.userDetails.userName).subscribe(
      res => {
        this.getPhoneNumberList("");
      },
      err => {
        console.log(err);
      }
    );
  }

  requestCANumber() {
    this.service.requestCANumber(this.userDetails.userName).subscribe(
      res => {
        this.getPhoneNumberList("");
      },
      err => {
        console.log(err);
      }
    );
  }


  callFn(phoneNumber) {
    localStorage.setItem("selectedNumber", phoneNumber);
    this.service.selectedNumber = phoneNumber;
    this.selectedNumber = phoneNumber;
    this.service.populateConversations();
  }

  clickConversation(conversation) {
    this.service.userSelectedConversation = conversation;
    this.conversation.userSelectedConversation = conversation;
    localStorage.setItem("conversation", JSON.stringify(conversation));
    this.router.navigate(['/conversation']);
  }

  sendMessage() {
    this.service.sendMessage(this.messageBody, this.selectedNumber, this.recipientPhone).subscribe(
      res => {
        this.messageBody = "";
        this.recipientPhone = "";

      }
    );
  }

  deleteConversation(conversation, e, modal) {
    modal.close('Save click');
    console.log("Outputting conversation");
    conversation = this.recreateConversationCase(conversation);
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

  renameConversation(conversation, e, modal) {
    modal.close('Save click');
    conversation.ConversationName = this.newNameField;
    conversation = this.recreateConversationCase(conversation);
    e.stopPropagation();
    this.service.renameConversation(conversation).subscribe(
      res => {
        this.service.populateConversations()
      },
      err => {
        console.log(err);
      }
    )
  }

  recreateConversationCase(conversation) {
    conversation.LastMessage = conversation.lastMessage;
    conversation.ToPhoneNumber = conversation.toPhoneNumber;
    conversation.FromPhoneNumber = conversation.fromPhoneNumber;
    conversation.ConversationId = conversation.conversationId;
    conversation.LastMessageTime = conversation.lastMessageTime; 

    return conversation;
  }

  dontPropogate(e) {
    e.stopPropagation();
  }

  getContactList() {
    this.service.getUsersContacts().subscribe(
      res => {
        this.service.contactList = [];
        let array = res as Array<ContactDetail>;
        for (let element of array) {
          this.service.contactList.push(element);
        }
        if (this.service.contactList.length > 0) {
          this.selectedContact = this.service.contactList[0];
        }
      },
      err => {
        console.log(err);
      }
    )
  }

  conversationHasContactName(conversation) {
    console.log("convo has contact");
    console.log(conversation);
    if (conversation.contactName == 'null' || conversation.contactName == '' || conversation.contactName == undefined) {
      return false;
    }
    return true;
  }

  conversationHasConversationName(conversation) {
    if (conversation.conversationName == 'null' || conversation.conversationName == '' || conversation.conversationName == undefined) {
      return false;
    }
    return true;
  }

  contact(content, e) {
    e.stopPropagation();
    this.modalService.open(content, {ariaLabelledBy: 'lookupContact'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  
  contactSelected(contact) {
    this.selectedContact = contact;
    this.recipientPhone = contact.phoneNumber;
  }

}

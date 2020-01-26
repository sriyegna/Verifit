import { Component, OnInit, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { PhoneDetail } from '../shared/phone-detail.model';
import { ConversationComponent } from '../conversation/conversation.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ContactDetail } from '../shared/contact-detail.model';
import { ToastrService } from 'ngx-toastr';

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
  sendNumberValid: boolean;

  constructor(private router:Router, public service:UserService, private conversation:ConversationComponent, private modalService: NgbModal, private toastr:ToastrService) { }

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
    if (this.sendNumberValid) {
      this.service.sendMessage(this.messageBody, this.selectedNumber, this.recipientPhone).subscribe(
        res => {
          this.toastr.success("Message sent to: " + this.recipientPhone)
          this.messageBody = "";
          this.recipientPhone = "";
        },
        err => {
          this.toastr.error("Error: " + err);
        }
      );
    }
    else {
      this.toastr.error("Number is not in the correct format.");
    }
    
  }

  deleteConversation(conversation, e, modal) {
    modal.close('Save click');
    conversation = this.recreateConversationCase(conversation);
    e.stopPropagation();
    this.service.deleteConversation(conversation).subscribe(
      res => {
        this.service.populateConversations()
        this.toastr.success("Deleted conversation");
      },
      err => {
        console.log(err);
        this.toastr.error("Error: " + err);
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
        this.toastr.success("Renamed conversation");
      },
      err => {
        console.log(err);
        this.toastr.error("Error: " + err);
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

  validateNumber() {
    let regexp = new RegExp('^[+1][0-9]{11}$');
    this.sendNumberValid = regexp.test(this.recipientPhone);
  }

}

import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { ContactDetail } from '../shared/contact-detail.model';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ObjectUnsubscribedError } from 'rxjs';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styles: []
})
export class ContactsComponent implements OnInit {

  closeResult;
  userDetails;
  newContactName: string;
  newContactNumber: string;
  addContactName: string;
  addContactNumber: string;
  
  constructor(public service: UserService, private modalService:NgbModal) { }

  ngOnInit() {
    this.service.getUserProfile().subscribe(
      res => {
        this.userDetails = res;
        var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
        this.userDetails.role = payLoad.role;
        this.service.username = this.userDetails.userName;
        this.service.userDetails = this.userDetails;

        this.getContactList();
      },
      err => {
        console.log(err);
      }
    );

  }

  getContactList() {
    this.service.getUsersContacts().subscribe(
      res => {
        console.log("Obtained contacts");
        console.log(res);
        this.service.contactList = [];
        let array = res as Array<ContactDetail>;
        for (let element of array) {
          this.service.contactList.push(element);
        }
      },
      err => {
        console.log(err);
      }
    )
  }

  changeContactName(content, e) {
    e.stopPropagation();
    this.modalService.open(content, {ariaLabelledBy: 'modal-changeContactName'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  submitChangeContactName(contact, modal) {
    modal.close('Save click'); 
    this.service.changeContactName(contact, this.newContactName).subscribe(
      res => {
        this.getContactList();
        console.log("Changed contact name");
      },
      err => {
        console.log(err);
      
      }
    );
  }

  changeContactNumber(content, e) {
    e.stopPropagation();
    this.modalService.open(content, {ariaLabelledBy: 'modal-changeContactNumber'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  submitChangeContactNumber(contact, modal) {
    modal.close('Save click');
    console.log("Changing num");    
    this.service.changeContactNumber(contact, this.newContactNumber).subscribe(
      res => {
        this.getContactList();
        console.log("Changed contact number");
      },
      err => {
        console.log(err);
      
      }
    );
  }

  deleteContact(content, e) {
    e.stopPropagation();
    this.modalService.open(content, {ariaLabelledBy: 'modal-changeContactNumber'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  submitDeleteContact(contact, modal) {
    modal.close('Save click');
    console.log("Deleting contact");    
    this.service.deleteContact(contact).subscribe(
      res => {
        this.getContactList();
        console.log("Delete contact");
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

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  addContact() {
    this.service.addContact(this.addContactName, this.addContactNumber).subscribe(
      res => {
        console.log("added contact");
        this.getContactList();
      },
      err => {
        console.log(err);
      }
    )
  }

}

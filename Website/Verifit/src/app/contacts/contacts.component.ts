import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { ContactDetail } from '../shared/contact-detail.model';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ObjectUnsubscribedError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

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
  addNumberValid: boolean;
  newNumberValid: boolean;
  
  constructor(public service: UserService, private modalService:NgbModal, private toastr:ToastrService) { }

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
    this.modalService.open(content, {ariaLabelledBy: 'modal-changeContactName', backdrop: false}).result.then((result) => {
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
        this.toastr.success("Changed contact name to: " + this.newContactName);
        this.newContactName = "";
      },
      err => {
        console.log(err);
        this.toastr.error("Error: " + err);
      }
    );
  }

  changeContactNumber(content, e) {
    e.stopPropagation();
    this.modalService.open(content, {ariaLabelledBy: 'modal-changeContactNumber', backdrop: false}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  submitChangeContactNumber(contact, modal) {
    if (this.newNumberValid) {
      modal.close('Save click'); 
      this.service.changeContactNumber(contact, this.newContactNumber).subscribe(
        res => {
          this.getContactList();
          this.toastr.success("Changed contact number to: " + this.newContactNumber);
          this.newContactNumber = "";
        },
        err => {
          console.log(err);
          this.toastr.error("Error: " + err);
        }
      );
    }
    else {
      this.toastr.error("Number is not in the correct format.");
    }
  }

  deleteContact(content, e) {
    e.stopPropagation();
    this.modalService.open(content, {ariaLabelledBy: 'modal-changeContactNumber', backdrop: false}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  submitDeleteContact(contact, modal) {
    modal.close('Save click');
    this.service.deleteContact(contact).subscribe(
      res => {
        this.getContactList();
        this.toastr.success("Deleted contact: " + contact.ContactName);
      },
      err => {
        console.log(err);
        this.toastr.error("Error: " + err);
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
    if (this.addNumberValid) {
      this.service.addContact(this.addContactName, this.addContactNumber).subscribe(
        res => {
          this.getContactList();
          this.toastr.success("Added contact: " + this.addContactName);
        },
        err => {
          console.log(err);
          this.toastr.error("Error: " + err);
        }
      );
    }
    else {
      this.toastr.error("Number is not in the correct format.");
    }
    
  }

  validateNumber() {
    let regexp = new RegExp('^[+1][0-9]{11}$');
    this.addNumberValid = regexp.test(this.addContactNumber);
  }

  validateChangeNumber() {
    let regexp = new RegExp('^[+1][0-9]{11}$');
    this.newNumberValid = regexp.test(this.newContactNumber);
  }

}

import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { ContactDetail } from '../shared/contact-detail.model';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styles: []
})
export class ContactsComponent implements OnInit {

  closeResult;
  newContactName: string;
  
  constructor(public service: UserService, private modalService:NgbModal) { }

  ngOnInit() {
    //load contacts
    this.getContactList();

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
    console.log("Changing num");    
    this.service.changeContactName(contact, this.newContactName).subscribe(
      res => {
        console.log(res);
        console.log("Forwarding number changed");
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

}

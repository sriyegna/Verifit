import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PhoneDetail } from '../shared/phone-detail.model';

@Component({
  selector: 'app-phone-manager',
  templateUrl: './phone-manager.component.html',
  styleUrls: ['./phone-manager.component.css']
})
export class PhoneManagerComponent implements OnInit {

  userDetails;
  forwardingNumberField: string;
  closeResult: string;
  constructor(public service:UserService, private modalService:NgbModal) { }

  ngOnInit() {
    this.service.getUserProfile().subscribe(
      res => {
        this.userDetails = res;
        var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
        this.userDetails.role = payLoad.role;
        this.service.username = this.userDetails.userName;
        this.service.userDetails = this.userDetails;

        this.getPhoneNumberList("");
      },
      err => {
        console.log(err);
      }
    );
  }

  getPhoneNumberList(string) {
    this.service.getUsersNumbers(this.userDetails.userName).subscribe(
      res => {
        this.service.userPhoneNumbers = res;
        console.log("Outputting phone numbers");
        console.log(res);
        this.service.phoneNumbers = [];
        let array = res as Array<PhoneDetail>;
        for (let element of array) {
          this.service.phoneNumbers.push(element.PhoneNumber);
        }
        console.log(this.service.selectedNumber);
      },
      err => {
        console.log(err);
      
      }
    );
  }

  changeForward(content, e) {
    e.stopPropagation();
    this.modalService.open(content, {ariaLabelledBy: 'modal-changeForward'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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

  releaseNumber(phone) {
    console.log("in PH component");
    console.log(phone);
    this.service.releaseNumber(phone).subscribe(
      res => {
        console.log("Number released");
        this.getPhoneNumberList("");
      },
      err => {
        console.log(err);
      }
    )
  }

  changeForwardingNumber(phone, modal) {
    modal.close('Save click');
    console.log("Changing num");    
    this.service.changeForwardingNumber(phone, this.forwardingNumberField).subscribe(
      res => {
        console.log(res);
        console.log("Forwarding number changed");
        this.getPhoneNumberList("");
      },
      err => {
        console.log(err);
      
      }
    );
  }

}

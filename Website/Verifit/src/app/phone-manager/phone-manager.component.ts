import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PhoneDetail } from '../shared/phone-detail.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-phone-manager',
  templateUrl: './phone-manager.component.html',
  styleUrls: ['./phone-manager.component.css']
})

export class PhoneManagerComponent implements OnInit {

  userDetails;
  forwardingNumberField: string;
  closeResult: string;
  changeNumberValid: boolean;

  constructor(public service:UserService, private modalService:NgbModal, private toastr:ToastrService) { }

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
        this.service.phoneNumbers = [];
        let array = res as Array<PhoneDetail>;
        for (let element of array) {
          this.service.phoneNumbers.push(element.PhoneNumber);
        }
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

  release(content, e) {
    e.stopPropagation();
    this.modalService.open(content, {ariaLabelledBy: 'modal-release'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  releaseNumber(phone, modal) {
    modal.close('Save click');
    this.service.releaseNumber(phone).subscribe(
      res => {
        this.getPhoneNumberList("");
        this.toastr.success("Number " + phone.phoneNumber + " has been released.");
      },
      err => {
        console.log(err);
        this.toastr.error("Error: " + err);
      }
    )
  }

  changeForwardingNumber(phone, modal) {
    if (this.changeNumberValid) {
      modal.close('Save click');
      this.service.changeForwardingNumber(phone, this.forwardingNumberField).subscribe(
        res => {
          this.getPhoneNumberList("");
          this.toastr.success("Forwarding number for " + phone.phoneNumber + "changed to: " + this.forwardingNumberField);
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

  requestUSNumber() {
    this.service.requestUSNumber(this.userDetails.userName).subscribe(
      res => {
        this.getPhoneNumberList("");
        let ph: any;
        ph = res;
        this.toastr.success("Obtained US Number: " + ph.phoneNumber);
        
      },
      err => {
        console.log(err);
        this.toastr.error("Error: " + err);
      }
    );
  }

  requestCANumber() {
    this.service.requestCANumber(this.userDetails.userName).subscribe(
      res => {
        this.getPhoneNumberList("");
        let ph: any;
        ph = res;
        this.toastr.success("Obtained Canadian Number: " + ph.phoneNumber);
      },
      err => {
        console.log(err);
        this.toastr.error("Error: " + err);
      }
    );
  }

  validateNumber() {
    let regexp = new RegExp('^[+1][0-9]{11}$');
    this.changeNumberValid = regexp.test(this.forwardingNumberField);
  }

}

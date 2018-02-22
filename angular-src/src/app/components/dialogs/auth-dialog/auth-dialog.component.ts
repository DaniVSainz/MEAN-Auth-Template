import { ValidateService } from './../../../services/validate.service';
import { AuthService } from './../../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import {Component, OnInit, Input, EventEmitter} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';



@Component({
  selector: 'app-auth-dialog',
  templateUrl: './auth-dialog.component.html',
  styleUrls: ['./auth-dialog.component.scss']
})
export class AuthDialogComponent implements OnInit{
  name: String;
  username: String;
  email: String;
  password: String; 
  passwordB: String; 
  whatDialog: String;
  register: Boolean;
  msgDialog:String = '';
  alertColor:String='';

  constructor(public dialogRef: MatDialogRef<AuthDialogComponent>,
    private validateService: ValidateService,
    private authService: AuthService,
    private router: Router,
    private flashMessage: FlashMessagesService,
    ) {
  }

  ngOnInit(){
    if (this.whatDialog === 'register'){
      this.register = true;
    } else {
      this.register = false ;
    }
  }

  onRegisterSubmit() {
    const user = {
      name: this.name,
      email: this.email,
      username: this.username,
      password: this.password,
      passwordB: this.passwordB
    }
    // Required Fields
    if(!this.validateService.validateRegister(user)) {
      this.flashMessage.show('Please fill in all fields', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }
    // Validate Email
    if(!this.validateService.validateEmail(user.email)) {
    this.flashMessage.show('Please use a valid email', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }
    if(!this.validateService.validatePassword(user)) {
      this.flashMessage.show('Your password were not typed identicaly.Please try again.', {cssClass: 'alert-danger', timeout: 3000});
        return false;
      }
    // Register user
    this.authService.registerUser(user).subscribe(
      res=>{
        this.flashMessage.show(res.msg , {cssClass: "alert-success", timeout: 3000});
        this.msgDialog= res.msg;
        this.alertColor="alert-success";
        this.closeDialog();
        this.router.navigate(['/login']);
      },err =>{
        err=err.json();
        this.msgDialog= err.msg;
        this.alertColor="alert-danger";
        this.flashMessage.show(err.msg, {cssClass: 'alert-danger', timeout: 3000});
      }
    );
  }

  closeDialog(){
    this.dialogRef.close();
  }

  onLoginSubmit() {
    const user = {
      username: this.username,
      password: this.password
    }

    this.authService.authenticateUser(user).subscribe(
      res => {
        this.authService.storeUserData(res.token, res.user);
        this.flashMessage.show('You are now logged in', {cssClass: 'alert-success', timeout: 5000});
        this.msgDialog= res.msg;
        this.alertColor="alert-success";
        this.dialogRef.close();
        this.router.navigate(['dashboard']);
      },err => {
        err=err.json();
        this.flashMessage.show(err.msg, {cssClass: 'alert-danger', timeout: 5000});
        this.alertColor="alert-danger";
        this.msgDialog= err.msg;
    });
  }
}

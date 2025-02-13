import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { NgxPageScrollModule } from 'ngx-page-scroll';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserComponent } from './user/user.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { UserService } from './shared/user.service';
import { LoginComponent } from './user/login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { BronzePanelComponent } from './bronze-panel/bronze-panel.component';
//import { SilverPanelComponent } from './silver-panel/silver-panel.component';
import { GoldPanelComponent } from './gold-panel/gold-panel.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { ConversationComponent } from './conversation/conversation.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PhoneManagerComponent } from './phone-manager/phone-manager.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AccountManagerComponent } from './account-manager/account-manager.component';
import { ReleasetriggerComponent } from './releasetrigger/releasetrigger.component';

@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    RegistrationComponent,
    LoginComponent,
    HomeComponent,
    AdminPanelComponent,
    BronzePanelComponent,
    //SilverPanelComponent,
    GoldPanelComponent,
    ForbiddenComponent,
    ConversationComponent,
    FrontpageComponent,
    NavbarComponent,
    PhoneManagerComponent,
    ContactsComponent,
    AccountManagerComponent,
    ReleasetriggerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ToastrModule.forRoot({
      progressBar: true
    }),
    NgxPageScrollCoreModule,
    NgxPageScrollModule,
    NgbModule
  ],
  providers: [UserService,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  },
  ConversationComponent,
  NavbarComponent
],
  bootstrap: [AppComponent]
})
export class AppModule { }

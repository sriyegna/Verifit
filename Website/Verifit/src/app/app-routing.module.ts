import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user/user.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { LoginComponent } from './user/login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { BronzePanelComponent } from './bronze-panel/bronze-panel.component';
import { GoldPanelComponent } from './gold-panel/gold-panel.component';
//import { SilverPanelComponent } from './silver-panel/silver-panel.component';
import { ConversationComponent } from './conversation/conversation.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { PhoneManagerComponent } from './phone-manager/phone-manager.component';
import { ContactsComponent } from './contacts/contacts.component';


const routes: Routes = [
  {path:'', redirectTo:'/front', pathMatch:'full'},
  {path:'front', component:FrontpageComponent},
  {path:'user', component:UserComponent, 
    children: [
      {path:'registration', component:RegistrationComponent}, // /user/register
      {path:'login', component:LoginComponent} // /user/login
    ]
  },
  {path:'home', component:HomeComponent, canActivate:[AuthGuard]},
  {path:'forbidden', component:ForbiddenComponent},
  {path:'adminpanel', component:AdminPanelComponent, canActivate:[AuthGuard], data: {permittedRoles:['Admin']}},
  {path:'bronzepanel', component:BronzePanelComponent, canActivate:[AuthGuard], data: {permittedRoles:['Bronze']}},
  {path:'phone-manager', component:PhoneManagerComponent, canActivate:[AuthGuard], data: {permittedRoles:['Bronze']}},
  {path:'contact-manager', component:ContactsComponent, canActivate:[AuthGuard], data: {permittedRoles:['Bronze']}},
  //{path:'silverpanel', component:SilverPanelComponent, canActivate:[AuthGuard], data: {permittedRoles:['Silver']}},
  {path:'goldpanel', component:GoldPanelComponent, canActivate:[AuthGuard], data: {permittedRoles:['Gold']}},
  {path:'conversation', component:ConversationComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

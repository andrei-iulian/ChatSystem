import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { DashComponent } from './dash/dash.component';
import { GroupComponent } from './group/group.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'dash', component: DashComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashComponent,
    GroupComponent
  ],
  imports: [
    NgbModule,
    RouterModule.forRoot(routes),
    BrowserModule,
    FormsModule,
    HttpClientModule,
  ],
  exports: [
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

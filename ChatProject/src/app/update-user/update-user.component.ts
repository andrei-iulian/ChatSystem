import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User, APIResponse } from '../dash/dash.component';

export interface Groups {
  Groups: string;
  success: boolean;
}

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})

export class UpdateUserComponent implements OnInit {
  userData = <any>{};
  nUser: string;
  nPassword: string;
  nEmail: string;
  nUserType: string;
  groups = [];
  nGroups = {};
  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.nUser = sessionStorage.getItem('updateUser');
    this.getUserData();
  }

  Submit() {
    this.http.post<APIResponse>('/api/UpdateUser', {userName: this.nUser, userType: this.nUserType,
    password: this.nPassword, email: this.nEmail, groups: JSON.stringify(this.nGroups)}).subscribe (
      data => {
        if (data.result === 'Success') {
          console.log('Updated User');
          this.router.navigateByUrl('/dash');
        } else {
          alert('Error Updating User');
        }
      }
    );
  }

  Back() {
    this.router.navigateByUrl('/dash');
  }

  getUserData() {
  this.http.post<User>('/api/UserData', {username: this.nUser}).subscribe(
    data => {
      if (data.success) {
        this.userData = JSON.parse(data.UserData);
        console.log(this.userData);
        this.nPassword = this.userData.Password;
        this.nEmail = this.userData.Email;
        this.nUserType = this.userData.UserType;
        this.getGroupsData();
      } else if (data.UserData === 'NotFound') {
        alert('Not a valid Username');
        this.router.navigateByUrl('/dash');
      }
    },
    error => {
      alert('failed');
    });
  }

  getGroupsData() {
    this.http.get<Groups>('/api/Groups').subscribe(
      data => {
        if (data.success) {
          const groups = JSON.parse(data.Groups);
          for (let i = 0; i < groups.length; i++) {
            this.nGroups[groups[i].Group] = this.userData.Groups.includes(groups[i].Group);
            this.groups.push(groups[i].Group);
          }
        } else {
          alert('Failed to retireve group data');
          this.router.navigateByUrl('dash');
        }
      }
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export interface User {
  UserData: string;
  success: boolean;
}

export interface APIResponse {
  result: string;
}

export interface UserDataObject {
  Username: string;
  UserType: string;
  Groups: object;
}

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.css']
})
export class DashComponent implements OnInit {
  modalType: string;
  username: string;
  nGroupName: string;
  userData: UserDataObject;
  nUserType = 'Normie';
  nUser: string;
  update = false;

  constructor(private router: Router, private modalService: NgbModal, private http: HttpClient) { }

  ngOnInit() {
    if ('username' in localStorage) {
      this.username = localStorage.getItem('username');
    }
    this.getUserData();
  }

  GetUser(uname: string) {
    return this.http.post<User>('/api/UserData', {username: uname});
  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'CreateTitle'}).result.then((result) => {
      if (result === 'Create') {
        if (this.modalType === 'Group') {
          if (this.nGroupName !== '') {
            this.CreateGroup(this.nGroupName);
          }
        } else if (this.modalType === 'User') {
          this.UpdateUser();
        }
      }
    }, (reason) => {  });
  }

  Logout() {
    localStorage.removeItem('username');
    this.router.navigateByUrl('/login');
  }

  UpdateUser() {
    this.http.post<APIResponse>('/api/UpdateUser', {groupName: this.nGroupName,
      userName: this.nUser, userType: this.nUserType, update: this.update}).subscribe(
      data => {
        if (data.result === 'UserExists') {
          alert('Users by that Name Exists');
        } else if ( data.result === 'ReadFail') {
          alert('Server failed to load Database');
        } else if (data.result === 'GroupFailed') {
          alert('That Group doesn\'t Exist');
        } else if (data.result === 'Success') {
          console.log('Created User');
        }
      }
    );
  }

  CreateGroup(GroupName: string) {
    this.http.post<APIResponse>('/api/AddGroup', {groupName: GroupName, User: this.username}).subscribe(
      data => {
        if (data.result === 'Exists') {
          alert('Group by that Name Exists');
        } else if ( data.result === 'ReadFail') {
          alert('Server failed to load Database');
        } else if (data.result === 'Success') {
          this.ngOnInit();
          console.log('Created Group');
        }
      }
    );
  }

  normieUser() {
    const target = document.getElementById('btnGroup');
    target.style.display = 'none';
  }

  getUserData() {
    this.GetUser(this.username).subscribe(
      data => {
        if (data.success) {
          this.userData = JSON.parse(data.UserData);
          if (this.userData.UserType === 'Normie') {
            this.normieUser();
          }
        } else if (data.UserData === 'NotFound') {
          alert('Not a valid Username');
          this.router.navigateByUrl('/login');
        }
      },
      error => {
        alert('failed');
      });
  }

}

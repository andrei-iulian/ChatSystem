import { Component, OnInit } from '@angular/core';
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
  Groups: Array<string>;
  Profile: string;
}

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.css']
})
export class DashComponent implements OnInit {
  selectedfile = null;
  profile = null;
  modalType: string;
  username: string;
  nGroupName: string;
  userData: UserDataObject;
  nUserType = 'Normie';
  nPassword: string;
  nGroups = {};
  nUser: string;
  update = false;

  constructor(private router: Router, private modalService: NgbModal, private http: HttpClient) { }

  ngOnInit() {
    if ('username' in sessionStorage) {
      this.username = sessionStorage.getItem('username');
    }
    this.getUserData();
  }

  // Function that Pops up the form for either creating a group or
  // updating/creating a user depending on which button was pressed.
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

  // Function for logging out of the dashboard and returing the client
  // to the login page
  Logout() {
    sessionStorage.removeItem('username');
    this.router.navigateByUrl('/login');
  }

  onFileSelected(event) {
    this.selectedfile = event.target.files[0];
  }

  Upload() {
    const fd = new FormData();
    fd.append('image', this.selectedfile, this.selectedfile.name);
    this.http.post<any>('/api/Upload', fd).subscribe(res => {
      if (res.result === 'NotValid') {
        alert('File type not valid');
      } else if (res.result === 'Success') {
        this.http.post<any>('/api/Profile', {user: this.username, file: this.selectedfile.name}).subscribe( response => {
          if (response.success === true) {
            this.profile = res.data.filename;
            sessionStorage.setItem('profile', this.profile);
          }
        });
      }
    });
  }

  // Function for updating a particular Users userType and adding a
  // user to a group
  UpdateUser() {
    sessionStorage.setItem('updateUser', this.nUser);
    this.router.navigateByUrl('/update-user');
  }

  CreateUser() {
    this.router.navigateByUrl('create-user');
  }

  // Function for creating a new group, the function puts the user
  // that created the function into the group
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

  // Function for hiding the functionallity for creating a group if the
  // user doesn't have access to it

  // Function for getting a users data to develop the dashboard for
  // them and displaying the groups and channels available
  getUserData() {
    this.http.post<User>('/api/UserData', {username: this.username}).subscribe(
      data => {
        if (data.success) {
          this.userData = JSON.parse(data.UserData);
          this.profile = this.userData.Profile;
          sessionStorage.setItem('profile', this.profile);
          for (const group of this.userData.Groups) {
            this.nGroups[group] = false;
          }
        } else if (data.UserData === 'NotFound') {
          alert('Not a valid Username');
          this.router.navigateByUrl('/login');
        } else {
          alert('Horrible Error, RUN!');
        }
      },
      error => {
        alert('Waaaat');
      });
  }

}

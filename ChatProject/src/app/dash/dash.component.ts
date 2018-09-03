import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface User {
  UserData: string;
  success: boolean;
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
  username: string;
  userData: UserDataObject;

  constructor(private router: Router, private form: FormsModule, private http: HttpClient) { }

  ngOnInit() {
    if ('username' in localStorage) {
      this.username = localStorage.getItem('username');
    }
    this.getUserData();
  }

  GetUser(uname: string) {
    return this.http.post<User>('/api/UserData', {username: uname});
  }

  CreateGroup() {
    console.log('a');
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
          console.log(this.userData.UserType);
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

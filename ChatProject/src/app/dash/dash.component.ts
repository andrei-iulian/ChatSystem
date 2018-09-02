import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface User {
  UserData: string;
  success: boolean;
}

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.css']
})
export class DashComponent implements OnInit {
  username: string;
  userData: Object;

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

  getUserData() {
    this.GetUser(this.username).subscribe(
      data => {
        if (data.success) {
          const Data = JSON.parse(data.UserData);
          this.userData = Data;
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

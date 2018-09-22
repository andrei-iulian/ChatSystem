import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { APIResponse } from '../dash/dash.component';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  username: string;
  password: string;

  ngOnInit() {
  }

  constructor(private router: Router, private http: HttpClient) { }

  // Function for storing the username in local storage and
  // navigating to the dashboard
  loginUser(event) {
    event.preventDefault();

    this.http.post<APIResponse>('/api/UserAuth', {user: this.username, pass: this.password}).subscribe(
      data => {
        if (data.result === 'Success') {
          if (typeof(Storage) !== 'undefined') {
            localStorage.setItem('username', this.username);
            this.router.navigateByUrl('/dash');
          }
        } else {
          alert('Incorrect Username or Password');
        }
      }
    );
  }

}

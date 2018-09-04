import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string;

  ngOnInit() {
  }

  constructor(private router: Router) { }

  // Function for storing the username in local storage and
  // navigating to the dashboard
  loginUser(event) {
    event.preventDefault();
    if (typeof(Storage) !== 'undefined') {
      localStorage.setItem('username', this.username);
      this.router.navigateByUrl('/dash');
    }
  }

}

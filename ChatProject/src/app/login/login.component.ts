import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';



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

  loginUser(event) {
    event.preventDefault();
    if (typeof(Storage) !== 'undefined') {
      localStorage.setItem('username', this.username);
      this.router.navigateByUrl('/dash');
    }
  }

}

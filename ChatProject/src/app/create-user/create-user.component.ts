import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { APIResponse } from '../dash/dash.component';
import { Groups } from '../update-user/update-user.component';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  groups = [];
  nGroups = {};
  nUser: string;
  nPassword: string;
  nEmail: string;
  nUserType: string;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.getGroupsData();
  }

  Submit() {
    this.http.post<APIResponse>('/api/CreateUser', {userName: this.nUser, userType: this.nUserType,
      password: this.nPassword, email: this.nEmail, groups: JSON.stringify(this.nGroups)}).subscribe(
      data => {
        if (data.result === 'Exists') {
          alert('User by that name already exists');
        } else if (data.result === 'Success') {
          this.router.navigateByUrl('/dash');
        } else {
          alert('Error creating User');
        }
      }
    );
  }

  getGroupsData() {
    this.http.get<Groups>('/api/Groups').subscribe(
      data => {
        if (data.success) {
          const groups = JSON.parse(data.Groups);
          for (let i = 0; i < groups.length; i++) {
            this.nGroups[groups[i].Group] = false;
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export interface ChannelData {
  channelData: string;
  success: boolean;
}

export interface DeleteResponse {
  result: string;
}

export interface ChannelResponse {
  success: boolean;
}

export interface ChannelObject {
  Channel: string;
  Users: object;
  Data: object;
}

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})

export class ChannelComponent implements OnInit {
  type: string;
  nUserName: string;
  userType: string;
  username: string;
  group: string;
  channel: string;
  channelData: ChannelObject;

  constructor(private router: Router, private modalService: NgbModal,  private http: HttpClient) { }

  ngOnInit() {
    this.userType = localStorage.getItem('type');
    this.username = localStorage.getItem('username');
    this.group = localStorage.getItem('group');
    this.channel = localStorage.getItem('channel');

    this.getChannelData();
  }

  Back() {
    this.router.navigateByUrl('/dash');
  }

  open(content, type: string) {
    this.modalService.open(content, {ariaLabelledBy: 'ChannelTitle'}).result.then((result) => {
      if (result === 'Create') {
        console.log(this.type);
        if (this.nUserName !== '') {
          if (this.type === 'Add') {
            this.AddUser();
          } else if (this.type === 'Del') {
            this.RemoveUser();
          }
        }
      }
    }, (reason) => {  });
  }

  DeleteChannel() {
    this.http.post<ChannelResponse>('/api/DeleteChannel', {channel: this.channel, group: this.group})
    .subscribe( data => {
      if (data.success === true) {
        console.log('Deleted Channel');
        this.Back();
      } else {
        alert('Failed to Delete Channel');
      }
    });
  }

  RemoveUser() {
    this.http.post<DeleteResponse>('/api/DelUserChannel', {channel: this.channel,
      group: this.group, user: this.nUserName}).subscribe( data => {
      if (data.result === 'Success') {
        console.log('Deleted A User');
        this.ngOnInit();
      } else if (data.result === 'NotExist') {
        alert('User Not in Group');
      } else {
        alert('Failed to Delete User');
      }
    });
  }

  AddUser() {
    this.http.post<ChannelResponse>('/api/AddUserChannel', {channel: this.channel, group: this.group, user: this.nUserName})
    .subscribe( data => {
      if (data.success === true) {
        console.log('Added a User Channel');
        this.ngOnInit();
      } else {
        alert('Failed to Add a User to the Channel');
      }
    });
  }

  getChannelData() {
    this.http.post<ChannelData>('/api/ChannelData', {channel: this.channel, group: this.group})
    .subscribe( data => {
        if (data.success === true) {
          this.channelData = JSON.parse(data.channelData);
        } else {
          alert('Failed to Retrieve Channel Data');
          this.router.navigateByUrl('/dash');
        }
      }
    );
  }

}
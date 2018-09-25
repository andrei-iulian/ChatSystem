import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { APIResponse } from '../dash/dash.component';
import { SocketService } from '../socket.service';

export interface ChannelData {
  channelData: string;
  success: boolean;
}

export interface ChannelResponse {
  success: boolean;
}

export interface ChannelObject {
  Channel: string;
  Users: object;
  Data: object;
  Chat: Array<string>;
}

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})

export class ChannelComponent implements OnInit, OnDestroy {
  type: string;
  nUserName: string;
  userType: string;
  username: string;
  group: string;
  channel: string;
  channelName: string;
  messages = [];
  message;
  connection;
  channelData: ChannelObject;

  constructor(private router: Router, private modalService: NgbModal,  private http: HttpClient, private sockServ: SocketService) { }

  ngOnInit() {
    this.userType = sessionStorage.getItem('type');
    this.username = sessionStorage.getItem('username');
    this.group = sessionStorage.getItem('group');
    this.channel = sessionStorage.getItem('channel');
    this.channelName = this.group + ':' + this.channel;
    this.connection = this.sockServ.getMessages(this.username, this.channelName).subscribe( message => {
      this.messages.push(message);
      console.log(this.messages);
      this.message = '';
    });
    this.getChannelData();
  }

  ngOnDestroy() {
    if (this.connection) {
      this.sockServ.leaveChannel(this.username, this.channelName);
      this.connection.unsubscribe();
    }
  }

  // Fuction using the Router to navigate back to the dashboard
  Back() {
    this.router.navigateByUrl('/dash');
  }

  // Function that Pops up the form for either adding or removing a user
  // depending on which button was pressed.
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

  SendMessage() {
    const str = this.username + '- ' + this.message;
    this.messages.push({type: 'message', text: str});
    this.sockServ.sendMessage(this.channelName, str);
    this.message = '';
  }

  // Function that handles the deletion of a channel by sending a post
  // request to the server
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

  // Function that handles the deletion of a user by sending a post
  // request to the server
  RemoveUser() {
    this.http.post<APIResponse>('/api/DelUserChannel', {channel: this.channel,
      group: this.group, user: this.nUserName}).subscribe( data => {
      if (data.result === 'Success') {
        console.log('Deleted A User');
        this.ngOnInit();
      } else if (data.result === 'NotExist') {
        alert('User isn\'t in Channel');
      } else {
        alert('Failed to Delete User');
      }
    });
  }

  // Function that handles the addition of a user by sending a post
  // request to the server
  AddUser() {
    this.http.post<APIResponse>('/api/AddUserChannel', {channel: this.channel, group: this.group, user: this.nUserName})
    .subscribe( data => {
      if (data.result === 'Success') {
        console.log('Added a User Channel');
        this.ngOnInit();
      } else if (data.result === 'NotExist') {
        alert('User does not exist');
      } else {
        alert('Failed to Add a User to the Channel');
      }
    });
  }

  // Function that gets the channel data from the server and displays
  // it to the client, if it fails the function returns to the dashboard
  getChannelData() {
    this.http.post<ChannelData>('/api/ChannelData', {channel: this.channel, group: this.group})
    .subscribe( data => {
        if (data.success === true) {
          this.channelData = JSON.parse(data.channelData);
          this.messages.push.apply(this.messages, this.channelData.Chat);
          console.log(this.messages);
        } else {
          alert('Failed to Retrieve Channel Data');
          this.Back();
        }
      }
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface ChannelData {
  channelData: string;
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
  username: string;
  group: string;
  channel: string;
  channelData: ChannelObject;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.username = localStorage.getItem('username');
    this.group = localStorage.getItem('group');
    this.channel = localStorage.getItem('channel');

    this.getChannelData();
  }

  Back() {
    this.router.navigateByUrl('/dash');
  }

  getChannelData() {
    this.http.post<ChannelData>('/api/ChannelData', {channel: this.channel, group: this.group})
    .subscribe( data => {
        if (data.success === false) {
          alert('Failed to Retrieve Channel Data');
          this.router.navigateByUrl('/dash');
        } else {
          this.channelData = JSON.parse(data.channelData);
          console.log(this.channelData.Users);
        }
      }
    );
  }

}

import { Component, OnInit, Input} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { APIResponse } from '../dash/dash.component';

export interface GroupData {
  GroupData: string;
  success: boolean;
}

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  @Input('groupName') groupName: string;
  @Input('userType') userType: string;
  username: string;
  nChannelName: string;
  deleted = false;
  buttonID: string;
  groupData: Object;
  isCollapsed = false;

  constructor(private router: Router, private modalService: NgbModal, private http: HttpClient) { }

  ngOnInit() {
    this.getGroupData();
    this.username = localStorage.getItem('username');
  }

  // Function for displaying the form for creating a new channel
  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'CreateChannelTitle'}).result.then((result) => {
      if (result === 'Create') {
        if (this.nChannelName !== '') {
          this.CreateChannel(this.nChannelName);
        }
      }
    }, (reason) => {  });
  }

  // Function for sending a request to the user to create a new channel
  // Adds the user that created the channel as its user
  CreateChannel(channelName: string) {
    this.http.post<APIResponse>('/api/CreateChannel', {groupName: this.groupName, channelName: channelName, userName: this.username})
    .subscribe( data => {
      if (data.result === 'Success') {
        console.log('Created Channel');
        this.ngOnInit();
      } else if (data.result === 'Exists') {
        alert('Channel by that name Exists in the Group');
      } else {
        alert('Failed to Create Channel');
      }
    });
  }

  // Function for deleting a particular group, hides the component if it has
  // been deleted
  DeleteGroup() {
    this.http.post<APIResponse>('/api/DeleteGroup', {groupName: this.groupName}).subscribe(
      data => {
        if (data.result === 'Failed') {
          alert('Failed to Delete Group');
        } else {
          console.log('Deleted Group');
          this.deleted = true;
        }
      }
    );
  }

  // Function for joining a particular channel, stores the user data
  // and data for what channel is being navigated too
  JoinChannel(channel: string) {
    if (typeof(Storage) !== 'undefined') {
      localStorage.setItem('type', this.userType);
      localStorage.setItem('channel', channel);
      localStorage.setItem('group', this.groupName);
      this.router.navigateByUrl('/channel');
    }
  }

  // Function that gets the group data from the server and displaying
  // it to the user.
  getGroupData() {
    this.http.post<GroupData>('/api/GroupData', {groupName: this.groupName}).subscribe(
      data => {
        if (data.success) {
          this.groupData = JSON.parse(data.GroupData);
        } else if (!data.success && data.GroupData === 'NotFound') {
          alert('Group by that name not Found');
        }
      },
      error => {
        alert('failed');
      });
  }

}

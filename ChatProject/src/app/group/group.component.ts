import { Component, OnInit, Input} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export interface GroupData {
  GroupData: string;
  success: boolean;
}

export interface HttpResponse {
  result: string;
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

  GetGroup(group: string) {
    return this.http.post<GroupData>('/api/GroupData', {groupName: group});
  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'CreateChannelTitle'}).result.then((result) => {
      if (result === 'Create') {
        if (this.nChannelName !== '') {
          this.CreateChannel(this.nChannelName);
        }
      }
    }, (reason) => {  });
  }

  CreateChannel(channelName: string) {
    this.http.post<HttpResponse>('/api/CreateChannel', {groupName: this.groupName, channelName: channelName, userName: this.username})
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

  DeleteGroup() {
    this.http.post<HttpResponse>('/api/DeleteGroup', {groupName: this.groupName}).subscribe(
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

  JoinChannel(channel: string) {
    if (typeof(Storage) !== 'undefined') {
      localStorage.setItem('type', this.userType);
      localStorage.setItem('channel', channel);
      localStorage.setItem('group', this.groupName);
      this.router.navigateByUrl('/channel');
    }
  }

  getGroupData() {
    this.GetGroup(this.groupName).subscribe(
      data => {
        if (data.success) {
          this.groupData = JSON.parse(data.GroupData);
        }
      },
      error => {
        alert('failed');
      });

  }

}

import { Component, OnInit, Input} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface GroupData {
  GroupData: string;
  success: boolean;
}

export interface DeleteGroupResponse {
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
  deleted = false;
  buttonID: string;
  groupData: Object;
  isCollapsed = false;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.getGroupData();
  }

  GetGroup(group: string) {
    return this.http.post<GroupData>('/api/GroupData', {groupName: group});
  }

  DeleteGroup() {
    this.http.post<DeleteGroupResponse>('/api/DeleteGroup', {groupName: this.groupName}).subscribe(
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

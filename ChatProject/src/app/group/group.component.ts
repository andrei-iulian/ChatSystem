import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface GroupData {
  channels: string;
  success: boolean;
}

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  @Input('groupName') groupName: string;
  isCollapsed = false;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.getGroupData();
  }

  GetGroup(group: string) {
    return this.http.post<GroupData>('/api/GroupData', {groupName: group});
  }

  getGroupData() {
    this.GetGroup(this.groupName).subscribe(
      data => {
        if (data.success) {
          console.log('GotHere 4');
        }
      },
      error => {
        alert('failed');
      });
  }

}

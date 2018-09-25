import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private url = 'http://localhost:3000';
  private socket;

  constructor() { }

  leaveChannel(user: string, channel: string) {
    this.socket.emit('leave', {'user': user, 'channel': channel});
  }

  sendMessage(channel: string, message: string) {
    this.socket.emit('add-message', {'channel': channel, 'message': message});
  }

  getMessages(user: string, channel: string) {
    const obmessages = new Observable(
      observer => {
        this.socket = io(this.url);
        this.socket.emit('join', {'user': user, 'channel': channel});

        this.socket.on('message', (data) => { observer.next(data); });

        return () => {
          this.socket.disconnect();
        };
      }
    );
    return obmessages;
  }
}

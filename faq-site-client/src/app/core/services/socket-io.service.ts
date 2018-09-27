import {Injectable, OnInit} from '@angular/core';
import io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketIOService implements OnInit {

  public socket: SocketIOClientStatic = new io();

  constructor() {
  }

  ngOnInit() {
  }

  public emit() {

  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient, private socket: Socket) {}

  // Login API to get user details
  login(email: string, userType: string): Observable<any> {
    return this.http.post('http://localhost:3000/login', { email, userType });
  }

  // Fetch delivery men for pharmacy to select
  getDeliveryMen(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/delivery-men');
  }

  // Fetch unread message count for each delivery man
  getUnreadMessagesCount(userId: string, deliveryManId: string): Observable<number> {
    return this.http.get<number>(`http://localhost:3000/unread-messages?userId=${userId}&deliveryManId=${deliveryManId}`);
  }

  // Méthode pour récupérer la liste des pharmacies
  getPharmacies(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/pharmacies');
  }

  // Register the user in socket
  registerUser(userId: string) {
    this.socket.emit('register', userId);
  }

  // Send a message through socket
  sendMessage(msg: any) {
    this.socket.emit('message', msg);
  }

  // Listen for incoming messages
  getMessages(): Observable<any> {
    return this.socket.fromEvent('message');
  }

  // Fetch the chat history between two users
  getChatHistory(userId: string, deliveryManId: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/chat-history?userId=${userId}&deliveryManId=${deliveryManId}`);
  }

  // Mark messages as read
  markMessagesAsRead(userId: string, deliveryManId: string): Observable<any> {
    return this.http.post('http://localhost:3000/mark-messages-read', { userId, deliveryManId });
  }
}

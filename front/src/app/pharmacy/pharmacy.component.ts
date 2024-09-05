import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css'],
})
export class PharmacyComponent implements OnInit {
  deliveryMen: any[] = [];
  selectedDeliveryMan: any = null;
  message = '';
  messageList: any[] = [];
  userId: string | null = null;
  pharmacyName: string | null = null;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId');
    this.pharmacyName = localStorage.getItem('pharmacyName');

    if (this.userId) {
      this.chatService.registerUser(this.userId);
    }

    // Récupérer la liste des livreurs
    this.chatService.getDeliveryMen().subscribe((data: any[]) => {
      this.deliveryMen = data;

      // Récupérer le nombre de messages non lus pour chaque livreur
      this.deliveryMen.forEach((deliveryMan) => {
        this.chatService.getUnreadMessagesCount(this.userId!, deliveryMan.id).subscribe((unreadCount: number) => {
          deliveryMan.unreadMessageCount = unreadCount;
        });
      });
    });

    // Écouter les messages entrants
    this.chatService.getMessages().subscribe((msg) => {
      if (msg.recipientId === this.userId || msg.senderId === this.selectedDeliveryMan?.id) {
        this.messageList.push(msg);
        if (msg.senderId !== this.userId && this.selectedDeliveryMan?.id !== msg.senderId) {
          const deliveryMan = this.deliveryMen.find(dm => dm.id === msg.senderId);
          if (deliveryMan) {
            deliveryMan.unreadMessageCount += 1;
          }
        }
      }
    });
  }

  selectDeliveryMan(deliveryMan: any) {
    this.selectedDeliveryMan = deliveryMan;

    // Récupérer l'historique des messages pour le livreur sélectionné
    if (this.selectedDeliveryMan) {
      this.chatService.getChatHistory(this.userId!, this.selectedDeliveryMan.id).subscribe((history: any[]) => {
        this.messageList = history;
      });

      // Marquer les messages comme lus
      this.chatService.markMessagesAsRead(this.userId!, this.selectedDeliveryMan.id).subscribe(() => {
        this.selectedDeliveryMan.unreadMessageCount = 0;
      });
    }
  }

  sendMessage() {
    if (this.selectedDeliveryMan) {
      const newMessage = {
        senderId: this.userId,
        recipientId: this.selectedDeliveryMan.id,
        message: this.message,
        date: new Date(),
      };

      this.chatService.sendMessage(newMessage);
      this.messageList.push(newMessage);
      this.message = '';
    }
  }
}

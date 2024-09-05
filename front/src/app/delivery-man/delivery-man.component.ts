import { Component, OnInit } from '@angular/core';
import { ChatService } from "../chat.service";

@Component({
  selector: 'app-delivery-man',
  templateUrl: './delivery-man.component.html',
  styleUrls: ['./delivery-man.component.css']
})
export class DeliveryManComponent implements OnInit {
  message = '';
  messageList: any[] = [];
  userId: string | null = null;
  deliveryManName: string | null = null;  // Variable pour stocker le nom du livreur
  selectedPharmacy: any = null;  // Stocke la pharmacie sélectionnée
  pharmacies: any[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId');
    this.deliveryManName = localStorage.getItem('deliveryManName');  // Récupérer le nom du livreur

    if (this.userId) {
      this.chatService.registerUser(this.userId);
    }

    // Récupérer la liste des pharmacies
    this.chatService.getPharmacies().subscribe((data: any[]) => {
      this.pharmacies = data;

      // Récupérer le nombre de messages non lus pour chaque pharmacie
      this.pharmacies.forEach((pharmacy) => {
        this.chatService.getUnreadMessagesCount(this.userId!, pharmacy.id).subscribe((unreadCount: number) => {
          pharmacy.unreadMessageCount = unreadCount;
        });
      });
    });

    // Écouter les messages entrants
    this.chatService.getMessages().subscribe((msg) => {
      if (msg.recipientId === this.userId || msg.senderId === this.selectedPharmacy?.id) {
        this.messageList.push(msg);

        if (msg.senderId !== this.userId && this.selectedPharmacy?.id !== msg.senderId) {
          const pharmacy = this.pharmacies.find(p => p.id === msg.senderId);
          if (pharmacy) {
            pharmacy.unreadMessageCount += 1;
          }
        }
      }
    });
  }

  selectPharmacy(pharmacy: any) {
    this.selectedPharmacy = pharmacy;  // Une seule pharmacie est sélectionnée

    // Récupérer l'historique des messages pour la pharmacie sélectionnée
    if (this.selectedPharmacy) {
      this.chatService.getChatHistory(this.userId!, this.selectedPharmacy.id).subscribe((history: any[]) => {
        this.messageList = history;
      });

      // Marquer les messages comme lus
      this.chatService.markMessagesAsRead(this.userId!, this.selectedPharmacy.id).subscribe(() => {
        this.selectedPharmacy.unreadMessageCount = 0;
      });
    }
  }

  sendMessage() {
    if (this.selectedPharmacy) {
      const newMessage = {
        senderId: this.userId,
        recipientId: this.selectedPharmacy.id,
        message: this.message,
        date: new Date()
      };

      this.chatService.sendMessage(newMessage);
      this.messageList.push(newMessage);  // Ajouter le message à l'interface immédiatement
      this.message = '';  // Effacer l'input après l'envoi
    }
  }
}

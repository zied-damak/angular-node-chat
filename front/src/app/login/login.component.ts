import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from "../chat.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html'
})
export class LoginComponent {
    email: string = '';
    userType: 'pharmacy' | 'deliveryMan' = 'pharmacy';

    constructor(private chatService: ChatService, private router: Router) {}

    login() {
        this.chatService.login(this.email, this.userType).subscribe(
            (user) => {
                localStorage.setItem('userId', user.id);
                localStorage.setItem('userType', this.userType);

                // Stocker les informations de la pharmacie ou du livreur dans le localStorage
                if (this.userType === 'pharmacy') {
                    localStorage.setItem('pharmacyName', user.pharmacyName);
                } else if (this.userType === 'deliveryMan') {
                    localStorage.setItem('deliveryManName', `${user.firstName} ${user.lastName}`);
                }

                this.router.navigate([`/${this.userType}`]); // Redirection vers le tableau de bord approprié
            },
            (error) => {
                console.error('Login échoué:', error);
            }
        );
    }
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {PharmacyComponent} from "./pharmacy/pharmacy.component";
import {DeliveryManComponent} from "./delivery-man/delivery-man.component";

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Redirect root to login
  { path: 'login', component: LoginComponent },
  { path: 'pharmacy', component: PharmacyComponent },
  { path: 'deliveryMan', component: DeliveryManComponent },
  { path: '**', redirectTo: 'login' }  // Wildcard route for undefined paths
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

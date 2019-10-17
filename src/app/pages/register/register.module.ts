import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RegisterPage } from './register.page';
import { BrMaskerModule } from "br-mask";


const routes: Routes = [
  {
    path: '',
    component: RegisterPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrMaskerModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}

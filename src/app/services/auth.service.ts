import { Injectable } from '@angular/core';
import { WebserviceService } from '../services/webservice.service';
import { AlertController, Events } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public ws: WebserviceService, public alertController: AlertController, public events: Events) { }

  async login(credentials) {
    return new Promise( async (resolve) => {
      this.ws.post('auth', credentials).subscribe( async (res) => {
        this.events.publish('auth', res);
        console.log(res)
        resolve(res);
      }, async (err) => {
        console.log(err);
        let msg = '';
        if (err.status === 401) msg = "Credenciais inválidas!";
        else msg = "Erro ao autenticar";
        resolve(err);
        const alert = await this.alertController.create({
          header: `Ops...`,
          message: msg,
          buttons: ['OK']
        });
        await alert.present();
      });
    });
  }
}

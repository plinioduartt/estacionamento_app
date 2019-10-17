import { Component, OnInit } from '@angular/core';
import { WebserviceService } from 'src/app/services/webservice.service';
import { AlertController, LoadingController, NavController, Events } from '@ionic/angular';

@Component({
  selector: 'app-my-tickets',
  templateUrl: './my-tickets.page.html',
  styleUrls: ['./my-tickets.page.scss'],
})
export class MyTicketsPage implements OnInit {
  user: any;
  itens: any;
  loading: any;

  constructor(public ws: WebserviceService, public loadingCtrl: LoadingController) {
    if (localStorage.getItem('user') != null && localStorage.getItem('user') != undefined)
      this.user = JSON.parse(localStorage.getItem('user'));
  }

  async loader(content) {
    if (content === 'dismiss') {
      await this.loading.dismiss();
    } else {
      this.loading = await this.loadingCtrl.create({
        message: content,
        translucent: true,
      });
      await this.loading.present();
    }
  }

  async ngOnInit() {
    await this.loader('Aguarde um instante...');
    this.ws.get('user/tickets/'+this.user.id).then( async (res) => {
      await res.tickets.forEach( async (item, index) => {
        let parts = item.created_at.split(" ");
        let hours = parts[1];
        let hours_parts = hours.split(":");
        hours = hours_parts[0]+':'+hours_parts[1];
        let date = parts[0];
        let aux_date = date.split("-").reverse().join('/');
        let aux_date_parts = aux_date.split("/");
        aux_date = aux_date_parts[0]+'/'+aux_date_parts[1];
        res.tickets[index].created_at = aux_date + ' ' + hours;

        let parts_updatedat = item.updated_at.split(" ");
        let hours_updatedat = parts_updatedat[1];
        let hours_updatedat_parts = hours_updatedat.split(":");
        hours_updatedat = hours_updatedat_parts[0]+':'+hours_updatedat_parts[1];
        let date_updatedat = parts_updatedat[0];
        let aux_date_updatedat = date_updatedat.split("-").reverse().join('/');
        let aux_date_updatedat_parts = aux_date_updatedat.split("/");
        aux_date_updatedat = aux_date_updatedat_parts[0]+'/'+aux_date_updatedat_parts[1];
        res.tickets[index].updated_at = aux_date_updatedat + ' ' + hours_updatedat;

        if (item.end_at != null && item.end_at != undefined) {
          let parts_endat = item.end_at.split(" ");
          let hours_endat = parts_endat[1];
          let hours_endat_parts = hours_endat.split(":");
          hours_endat = hours_endat_parts[0]+':'+hours_endat_parts[1];
          let date_endat = parts_endat[0];
          let aux_date_endat = date_endat.split("-").reverse().join('/');
          let aux_date_endat_parts = aux_date_endat.split("/");
          aux_date_endat = aux_date_endat_parts[0]+'/'+aux_date_endat_parts[1];
          res.tickets[index].end_at = aux_date_endat + ' ' + hours_endat;
        }       
      });
      await this.loader('dismiss');
      this.itens = await res.tickets;
    }, async (err) => {
      await this.loader('dismiss');
      console.log(err);
    });
  }

}

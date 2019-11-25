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
  itens = [];
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
        if (item.status == 'Ativo') {
          res.tickets[index].price = await this.get_price(item);
          res.tickets[index].price = res.tickets[index].price.toFixed(2);
        }

        /* FIX DO HORARIO DE VERAO */
          var fix1 = await new Date();
          await fix1.setTime(Date.parse(item.created_at));   
          await  fix1.setHours( fix1.getHours() - 1);

          let fixed1 = `${ fix1.getDate() }/${ fix1.getMonth() }/${ fix1.getFullYear() } ${ 
            fix1.getHours() < 10 ? 
            '0' + fix1.getHours(): fix1.getHours() 
          }:${ 
            fix1.getMinutes() < 10 ? 
            '0' + fix1.getMinutes(): fix1.getMinutes() 
          }:${ 
            fix1.getSeconds() < 10 ? 
            '0' + fix1.getSeconds(): fix1.getSeconds()  
          }`;
        /* FIX DO HORARIO DE VERAO */
        
        let parts = fixed1.split(" ");
        let hours = parts[1];
        let hours_parts = hours.split(":");
        hours = hours_parts[0]+':'+hours_parts[1];
        let date = parts[0];
        let aux_date = date.split("-").reverse().join('/');
        let aux_date_parts = aux_date.split("/");
        aux_date = aux_date_parts[0]+'/'+aux_date_parts[1];
        res.tickets[index].created_at = aux_date + ' ' + hours;


        /* FIX DO HORARIO DE VERAO */
          var fix2 = await new Date();
          await fix2.setTime(Date.parse(item.updated_at));   
          await  fix2.setHours( fix2.getHours() - 1);

          let fixed2 = `${ fix2.getDate() }/${ fix2.getMonth() }/${ fix2.getFullYear() } ${ 
            fix2.getHours() < 10 ? 
            '0' + fix2.getHours(): fix2.getHours() 
          }:${ 
            fix2.getMinutes() < 10 ? 
            '0' + fix2.getMinutes(): fix2.getMinutes() 
          }:${ 
            fix2.getSeconds() < 10 ? 
            '0' + fix2.getSeconds(): fix2.getSeconds()  
          }`;
        /* FIX DO HORARIO DE VERAO */
        
        let parts_updatedat = fixed2.split(" ");
        let hours_updatedat = parts_updatedat[1];
        let hours_updatedat_parts = hours_updatedat.split(":");
        hours_updatedat = hours_updatedat_parts[0]+':'+hours_updatedat_parts[1];
        let date_updatedat = parts_updatedat[0];
        let aux_date_updatedat = date_updatedat.split("-").reverse().join('/');
        let aux_date_updatedat_parts = aux_date_updatedat.split("/");
        aux_date_updatedat = aux_date_updatedat_parts[0]+'/'+aux_date_updatedat_parts[1];
        res.tickets[index].updated_at = aux_date_updatedat + ' ' + hours_updatedat;

        if (item.end_at != null && item.end_at != undefined) {

          /* FIX DO HORARIO DE VERAO */
            var fix3 = await new Date();
            await fix3.setTime(Date.parse(item.end_at));   
            await  fix3.setHours( fix3.getHours() - 1);

            let fixed3 = `${ fix3.getDate() }/${ fix3.getMonth() }/${ fix3.getFullYear() } ${ 
              fix3.getHours() < 10 ? 
              '0' + fix3.getHours(): fix3.getHours() 
            }:${ 
              fix3.getMinutes() < 10 ? 
              '0' + fix3.getMinutes(): fix3.getMinutes() 
            }:${ 
              fix3.getSeconds() < 10 ? 
              '0' + fix3.getSeconds(): fix3.getSeconds()  
            }`;
          /* FIX DO HORARIO DE VERAO */
        
          let parts_endat = fixed3.split(" ");
          if (parts_endat[0] == item.end_at)
            parts_endat = fixed3.split("T");

          let hours_endat = parts_endat[1];
          let hours_endat_parts = hours_endat.split(":");
          hours_endat = hours_endat_parts[0]+':'+hours_endat_parts[1];
          let date_endat = parts_endat[0];
          let aux_date_endat = date_endat.split("-").reverse().join('/');
          let aux_date_endat_parts = aux_date_endat.split("/");
          aux_date_endat = aux_date_endat_parts[0]+'/'+aux_date_endat_parts[1];
          res.tickets[index].end_at = aux_date_endat + ' ' + hours_endat;
          console.log('AAAAAA', aux_date_endat + ' ' + hours_endat)
        }       
      });
      await this.loader('dismiss');
      this.itens = await res.tickets;
    }, async (err) => {
      await this.loader('dismiss');
      console.log(err);
    });
  }

  async get_price(item) {
    console.log(item);
    return new Promise( async (resolve) => {
      var now = await Math.round((Date.now() / 1000));        
      var aux = new Date();
      await aux.setTime(Date.parse( item.created_at ));
      let created_at = await Math.round(aux.getTime() / 1000) ;
      let diff = await ((now - created_at));
      let min_diff = diff / 60;
      
      if (min_diff < 30) { // periodo gratuito
        resolve(0);
      } else { // fora do periodo gratuito
        if (min_diff <= 60) { // primeira hora
          resolve(10);
        } else { // demais horas
          let total = await (((min_diff - 60) / 60) * 5) + 10;
          console.log("TOTAL", total);
          resolve(total);
        }
      }
    });    
  }

}

import { Component, OnInit } from '@angular/core';
import { WebserviceService } from 'src/app/services/webservice.service';
import { FormGroup, FormBuilder, Validators }  from '@angular/forms';
import { AlertController, LoadingController, NavController, Events } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-billings',
  templateUrl: './billings.page.html',
  styleUrls: ['./billings.page.scss'],
})
export class BillingsPage implements OnInit {
  user: any;
  itens = [];
  ticket: any = {};
	group: FormGroup;
  form: any = {};
  loading: any;

  constructor(public ws: WebserviceService,
    private formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, 
    public alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private nav: NavController,
    private events: Events
  ) 
  {
    this.validate();
    if (localStorage.getItem('user') != null && localStorage.getItem('user') != undefined) {
      this.user = JSON.parse(localStorage.getItem('user'));
    }
  
    this.activatedRoute.params.subscribe( async (params) => {
      if (params.id !== null && params.id !== undefined) {
        
        await this.loader('Carregando informações...');
        this.ws.get('bills/ticket/'+params.id).then( async (res) => {

          let parts = res.bill.created_at.split(" ");
          let hours = parts[1];
          let hours_parts = hours.split(":");
          hours = hours_parts[0]+':'+hours_parts[1];
          let date = parts[0];
          let aux_date = date.split("-").reverse().join('/');
          let aux_date_parts = aux_date.split("/");
          aux_date = aux_date_parts[0]+'/'+aux_date_parts[1];
          res.bill.created_at = aux_date + ' ' + hours;
          if (res.bill.tickets.status == 'Ativo') {
            res.bill.tickets.price = await this.get_price(res.bill.tickets);
          }
          res.bill.running = true;
          this.ticket = await res.bill;
          await this.loader('dismiss');

        }, async (err) => {
          console.log(err);
          await this.loader('dismiss');
        });
      }
    });
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

  validate() {
    this.group = this.formBuilder.group({
      numero: ["", Validators.required],
      cpf: ["", Validators.required],
      validade: ["", Validators.required],
      codigo: ["", Validators.required]
    });
  }


  ngOnInit() {
    this.get_bills();
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
          resolve(total.toFixed(2));
        }
      }
    });    
  }

  async get_bills() {
    this.ws.get('bills/'+this.user.id).then( async (res) => {
      console.log(res)
      await res.bills.forEach( async (item, index) => {
        let parts = item.created_at.split(" ");
        let hours = parts[1];
        let hours_parts = hours.split(":");
        hours = hours_parts[0]+':'+hours_parts[1];
        let date = parts[0];
        let aux_date = date.split("-").reverse().join('/');
        let aux_date_parts = aux_date.split("/");
        aux_date = aux_date_parts[0]+'/'+aux_date_parts[1];
        res.bills[index].created_at = aux_date + ' ' + hours;
        if (item.tickets.status == 'Ativo') {
          res.bills[index].tickets.price = await this.get_price(item.tickets);
        }
      });

      this.itens = await res.bills;
    }, async (err) => { 
      console.log(err);
    });
  }

  async payment(item) {
    item.tickets.price = await this.get_price(item.tickets);
    if (item.tickets.status == 'Ativo') {
      item.running = true;
      this.ticket = await item;
    }
  }

  async submit(item) {
    let data = {
      status: 'Pago',
      method: 'Cartão de crédito',
    };
  
    await this.loader('Realizando pagamento...');
    this.ws.put('bills', data, item.id).subscribe( async (res) => {  // Atualizando pagamento
      console.log('Atualizado!', res);
      await this.loader('dismiss');
      await this.loader('Quase lá...');
      let ticket_data = {
        status: 'Inativo',
        price: this.ticket.tickets.price
      }
      this.ws.put('close-tickets', ticket_data, item.tickets.id).subscribe( async (res) => {  // Finalizando o ticket


        this.ws.put('vacancies', {}, item.tickets.vacancy_id).subscribe( async (res) => {  // Tornando a vaga disponível novamente
          await this.loader('dismiss');
          this.nav.navigateForward('/home');
          this.events.publish('finalizado');
        }, async (err) => {
          await this.loader('dismiss');
          console.log(err);
        });


      }, async (err) => {
        console.log(err);
        await this.loader('dismiss');
      });
    }, async (err) => {
      console.log(err);
      await this.loader('dismiss');
    });
  }

}

import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController, Events } from '@ionic/angular';
import { WebserviceService } from '../services/webservice.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  park_slots: any = JSON.parse(localStorage.getItem('park_slots')).park_slots;
  loading: any;
  authenticated: boolean = false;
  available_park_slots: any;
  ticket_timer: any = '';
  ticket: any = {
    running: true,
    timer: '...',
    manipulated_date: '...',
    created_at: '...',
    price: '...',
    code: '...',
    status: '...'
  };
  consulted_ticket: any = {
    running: false,
    timer: '...',
    manipulated_date: '...',
    created_at: '...',
    end_at: '...',
    price: '...',
    code: '...',
    status: '...',
    user_name: '...',
    user_id: '...'
  };
  user: any = {};

  constructor(
    public alertController: AlertController, 
    public ws: WebserviceService, 
    public loadingCtrl: LoadingController,
    public router: NavController,
    public events: Events
  ) {
    this.events.subscribe('consult_ticket', async (data) => {
      this.consult_ticket();
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

  async check_available_slots() {
    this.loader('Verificando...');
    this.ws.get('tickets').then( async (res) => {
      this.loader('dismiss');
     this.available_park_slots = await (this.park_slots - res.tickets.length);
      let title = "";
      let content = "";
      if (this.available_park_slots > 1) {
        title = "Que sorte!";
        content = `${ this.available_park_slots } vagas disponíveis`
      } else if (this.available_park_slots === 1) {
        title = "Que sorte!";
        content = `1 vaga disponível`
      } else {
        title = "Ops..."
        content = `Nenhuma vaga disponível...`;
      }

      this.basic_alert(title, content);
    }, async (err) => {
      this.loader('dismiss');
      console.log(err);
    });
  }

  async my_tickets() {
    
  }

  async create_ticket() {
    if (localStorage.getItem('token') == null || localStorage.getItem('token') == undefined) {
      let alert = await this.alertController.create({
        header: 'Ops...',
        message: 'Para acessar este recurso você precisa estar logado.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Logar',
            handler: () => {
              this.router.navigateForward('/login');
            }
          }
        ]
      });
      await alert.present();
    } else {
      let alert = await this.alertController.create({
        header: 'Confirmação',
        message: 'Tem certeza que deseja criar um ticket?',
        buttons: [
          {
            text: 'Não',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Sim',
            handler: async () => {
              if (this.available_park_slots == 0) {
                this.basic_alert('Ops...', 'O estacionamento está cheio!');
              } else {
                this.create_ticket_function();
              }
            }
          }
        ]
      });
      await alert.present();
    }
  }
  
  async create_ticket_function() {
    this.loader('Gerando token...');
    setTimeout(() => {
      this.loader('dismiss');
      this.loader('Quase lá...');

      let data = {
        status: "Ativo",
        price: "10",
        user_id: this.user.id
      };
      console.log('ticket sendo criado -->', data);
      this.ws.post('tickets', data).subscribe( async (res) => {
        if (res.status === 201) {
          let ticket = (JSON.parse(res['_body'])).ticket;
          this.loader('dismiss');

          localStorage.setItem('ticket', JSON.stringify(ticket));
          this.ticket.running = true;
          this.ticket.created_at = ticket.created_at;
          this.ticket.price = ticket.price;
          this.ticket.code = ticket.code;
          this.ticket.status = ticket.status;
          this.handle_time();
          this.handle_ticket_timer();
  
          let bills_data = {
            ticket_id: ticket.id,
            user_id: this.user.id,
            status: "Pagamento pendente",
            method: "Cartão de crédito (padrão)"
          };
  
          this.ws.post('bills', bills_data).subscribe( async (res) => {
            this.loader('dismiss');
            console.log('Pagamento pendente cadastrado com sucesso!', res);
          }, async (err) => {
            this.loader('dismiss');
            console.log('Erro ao cadastrar pagamento pendente --> ', err);
          });
        }
      }, async (err) => {
        this.loader('dismiss');
        console.log(err);
      });
    }, 2000);
    
  }

  async ticket_details() {
    if (localStorage.getItem('token') == null || localStorage.getItem('token') == undefined) {
      let alert = await this.alertController.create({
        header: 'Ops...',
        message: 'Para acessar este recurso você precisa estar logado.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Logar',
            handler: () => {
              this.router.navigateForward('/login');
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.consulted_ticket.created_at = this.ticket.manipulated_date;
      this.consulted_ticket.price = this.ticket.price;
      this.consulted_ticket.code = this.ticket.code;
      this.consulted_ticket.status = "Ativo";
      this.consulted_ticket.running = true;
      this.consulted_ticket.user_name = this.user.name;
      this.consulted_ticket.user_id = this.user.id;
    }
  }

  open_login() {
    this.router.navigateForward('/login');
  }

  ionViewDidEnter() {
    this.handle_authentication();
  }

  async handle_authentication() {
    if (localStorage.getItem('token') != null && localStorage.getItem('token') != undefined) {
      this.user = JSON.parse(localStorage.getItem('user'));
      this.handle_tickets(); // VERIFICA SE EXISTE TICKET ATIVO DESTE USUÁRIO
      this.authenticated = true;
    } else {
      this.authenticated = false;
      this.ticket.running = false;
    }
  }

  async handle_tickets() {
    this.ws.get('user/tickets/active/'+this.user.id).then( async (res) => {
      console.log('Quantidade de tickets meus que estão ativos -->', res);
      if (res.tickets == null) {
        this.ticket.running = false;
        localStorage.removeItem('ticket');
        clearInterval(this.ticket_timer);
      } else {
        localStorage.setItem('ticket', JSON.stringify(res.tickets));
        this.ticket.running = true;
        this.ticket.created_at = res.tickets.created_at;
        this.ticket.price = res.tickets.price;
        this.ticket.code = res.tickets.code;
        this.handle_time();
        this.handle_ticket_timer();
      }
    }, async (err) => {
      console.log(err);
    });
  }

  async handle_time() {
    let parts = this.ticket.created_at.split(" ");
    let hours = parts[1];
    let date = parts[0];
    console.log("DATA -->", date);
    console.log("HORAS -->", hours);
    let aux_date = date.split("-").reverse().join('/');
    this.ticket.manipulated_date = aux_date + ' ' + hours;
    console.log("DATA MANIPULADA -->", this.ticket.manipulated_date)
  }


  async handle_ticket_timer() {
    this.ticket_timer = setInterval( async () => {
      var now = await Math.round((Date.now() / 1000));        
      var aux = new Date();
      await aux.setTime(Date.parse( this.ticket.created_at ));
      let updated_at = await Math.round(aux.getTime() / 1000) ;
      let diff = await ((now - updated_at));

      let s     = await diff;
      let mins  = await Math.floor(s / 60);
      let m = await mins % 60;
      let hours = await Math.floor(mins / 60);
      let h = await hours % 60;
      let secs  = await s % 60;  
      
      if (hours == 0 && m == 0)
        secs = secs - 10;

      let timer:any = await (hours + ":" + (m < 10 ? '0' + m : m) + ':' + (secs < 10 ? '0' + secs : secs));
      this.ticket.timer = timer;
    }, 1000);
  }


  async consult_ticket() {
    const alert = await this.alertController.create({
      header: 'Consulte um ticket',
      inputs: [
        {
          name: 'code',
          type: 'text',
          placeholder: 'Digite o código do ticket'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Consultar',
          handler: async (data) => {
            await this.loader('Consultando...');

            this.ws.get('tickets/search/' + data.code).then( async (res) => {
              await this.loader('dismiss');

              if (res.ticket.length === 0) {
                this.basic_alert('Ops...', 'Nenhum ticket com esse código foi encontrado.');
              } else {

                if (res.ticket[0].end_at != null) {
                  let parts2 = res.ticket[0].end_at.split(" ");
                  let hours2 = parts2[1];
                  let date2 = parts2[0];
                  let aux_date2 = date2.split("-").reverse().join('/');
                  this.consulted_ticket.end_at = aux_date2 + ' ' + hours2;
                }

                let parts = res.ticket[0].created_at.split(" ");
                let hours = parts[1];
                let date = parts[0];
                let aux_date = date.split("-").reverse().join('/');
                this.consulted_ticket.created_at = aux_date + ' ' + hours;
                this.consulted_ticket.price = res.ticket[0].price;
                this.consulted_ticket.code = res.ticket[0].code;
                this.consulted_ticket.status = res.ticket[0].status;
                this.consulted_ticket.running = true;
                this.consulted_ticket.user_name = res.ticket[0].users.name;
                this.consulted_ticket.user_id = res.ticket[0].users.id;
              }
             

            }, async (err) => {
              await this.loader('dismiss');
              console.log('Erro ao buscar ticket pelo código -->', err);
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async basic_alert(title, content) {
    const alert = await this.alertController.create({
      header: `${ title }`,
      message: content,
      buttons: ['OK']
    });
    await alert.present();
  }

  nav_to(page) {
    this.router.navigateForward(page);
  }

}

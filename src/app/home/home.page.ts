import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController, Events } from '@ionic/angular';
import { WebserviceService } from '../services/webservice.service';
import { Router } from '@angular/router';

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
    id: '...',
    running: false,
    timer: '...',
    manipulated_date: '...',
    created_at: '...',
    price: 0,
    code: '...',
    status: '...'
  };
  consulted_ticket: any = {
    running: false,
    timer: '...',
    manipulated_date: '...',
    created_at: '...',
    end_at: '...',
    price: 0,
    code: '...',
    status: '...',
    user_name: '...',
    user_id: '...'
  };
  radio_value: any;
  user: any = {};

  constructor(
    public alertController: AlertController, 
    public ws: WebserviceService, 
    public loadingCtrl: LoadingController,
    public router: NavController,
    public events: Events,
    private route: Router
  ) {
    this.events.subscribe('consult_ticket', async (data) => {
      this.consult_ticket();
    });

    this.events.subscribe('finalizado', async (data) => {
      this.handle_tickets();
      this.consulted_ticket.running = false;
    });

    this.events.subscribe('login', async (data) => {
      this.user = data;
      this.authenticated = true;
    });

    this.events.subscribe('logout', async (data) => {
      this.user = {};
      this.authenticated = false;
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
    await this.loader('Verificando...');
    this.ws.get('vacancies').then( async (res) => {
      await this.loader('dismiss');
      console.log(res);
      var availabe = 0;
      var not_available = 0;
      var vacancies = [];
      var content = '';
      let title = "";

      await res.vacancies.forEach( async (item, index) => {
        vacancies.push({ code: item.code, status: item.status });

        if (item.status == 'Ativo') {
          availabe++;
        } else {
          not_available++;
        }
      });
      
      this.available_park_slots = await availabe;

      if (this.available_park_slots > 0) {
        this.router.navigateForward([ '/vacancies', { vacancies: JSON.stringify(vacancies) } ]);
      } else {
        title = "Ops..."
        content = `O estacionamento está lotado!`;
        this.basic_alert(title, content);
      }

    }, async (err) => {
      await this.loader('dismiss');
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
                // this.create_ticket_function();
                this.present_radio_alert();
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
        price: "0",
        user_id: this.user.id,
        vacancy_id: this.radio_value
      };
      console.log('ticket sendo criado -->', data);
      this.ws.post('tickets', data).subscribe( async (res) => {
        if (res.status === 201) {
          let ticket = (JSON.parse(res['_body'])).ticket;
          this.loader('dismiss');

          localStorage.setItem('ticket', JSON.stringify(ticket));
          this.ticket.running = true;
          this.ticket.id = ticket.id;
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

  async present_radio_alert() {
    await this.loader('Aguarde um instante...');
    this.ws.get('vacancies').then( async (res) => {
      await this.loader('dismiss');
      var radio = [];


      await res.vacancies.forEach( async (item, index) => {
        if (item.status == 'Ativo') {
         
          radio.push( {
            name: 'vacancy',
            type: 'radio',
            label: item.code,
            value: item.id,
            checked: false
          });
        } 
      });

      const alert = await this.alertController.create({
        header: 'Escolha a vaga',
        inputs: radio,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {
            text: 'Ok',
            handler: (value) => {
              this.radio_value = value;
              this.create_ticket_function();
            }
          }
        ]
      });
      await alert.present();

    }, async (err) => {
      console.log(err);
      await this.loader('dismiss');
    });
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

  ngOnInit() {
    this.handle_authentication();
    setTimeout(() => {
      this.get_price();
    }, 3000);
  }

  ionViewDidEnter() {
    this.handle_authentication();
    setTimeout(() => {
      this.get_price();
    }, 3000);
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
    // await this.loader('...');
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
        this.ticket.id = res.tickets.id;
        this.handle_time();
        this.handle_ticket_timer();
      }
      // await this.loader('dismiss');
    }, async (err) => {
      console.log(err);
      // await this.loader('dismiss');
    });
  }

  async handle_time() {
    let parts = this.ticket.created_at.split(" ");
    let hours = parts[1];
    let date = parts[0];
    let aux_date = date.split("-").reverse().join('/');
    this.ticket.manipulated_date = aux_date + ' ' + hours;
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
                
                var now = await Math.round((Date.now() / 1000));        
                var aux = new Date();
                await aux.setTime(Date.parse( res.ticket[0].created_at ));
                let created_at = await Math.round(aux.getTime() / 1000) ;
                let diff = await ((now - created_at));
                let min_diff = diff / 60;
                
                if (min_diff < 30) { // periodo gratuito
                  res.ticket[0].price = 0;
                } else { // fora do periodo gratuito
                  if (min_diff <= 60) { // primeira hora
                   res.ticket[0].price = 10; // primeira hora
                  } else { // demais horas
                    let total = (((min_diff - 60) / 60) * 5) + 10;
                   res.ticket[0].price = total;
                  }
                }

                let parts = res.ticket[0].created_at.split(" ");
                let hours = parts[1];
                let date = parts[0];
                let aux_date = date.split("-").reverse().join('/');
                this.consulted_ticket.created_at = aux_date + ' ' + hours;
                this.consulted_ticket.price = res.ticket[0].price.toFixed(2);
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

  async get_price() {
    var now = await Math.round((Date.now() / 1000));        
    var aux = new Date();
    await aux.setTime(Date.parse( this.ticket.created_at ));
    let created_at = await Math.round(aux.getTime() / 1000) ;
    let diff = await ((now - created_at));
    let min_diff = diff / 60;
    
    if (min_diff < 30) { // periodo gratuito
      this.ticket.price = 0;
    } else { // fora do periodo gratuito
      if (min_diff <= 60) { // primeira hora
        this.ticket.price = 10; // primeira hora
      } else { // demais horas
        let total = (((min_diff - 60) / 60) * 5) + 10;
        this.ticket.price = total.toFixed(2);
      }
    }
  }

  async pay_ticket() {
    this.route.navigate(['/billings', { id: this.ticket.id }]);
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

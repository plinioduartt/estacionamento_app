import { Component } from '@angular/core';

import { Platform, AlertController, LoadingController, NavController, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { WebserviceService } from './services/webservice.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Início',
      url: '/home',
      icon: '../assets/house.png'
    },
    {
      title: 'Consultar vagas',
      url: '/list',
      icon: '../assets/car.png'
    },
    {
      title: 'Consultar ticket',
      url: '/list',
      icon: '../assets/ticket.png'
    },
    {
      title: 'Pagamentos',
      url: '/billings',
      icon: '../assets/billing.png'
    }
  ];

  loading: any;
  park_slots: any = localStorage.getItem('park_slots') != null && localStorage.getItem('park_slots') != undefined ? JSON.parse(localStorage.getItem('park_slots')).park_slots : localStorage.setItem('park_slots', '6');
  authenticated: boolean = localStorage.getItem('token') !== null && localStorage.getItem('token') !== undefined ? true : false;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public alertController: AlertController, 
    public ws: WebserviceService, 
    public loadingCtrl: LoadingController,
    public nav: NavController,
    public events: Events
  ) {
    this.initializeApp();
    this.events.subscribe('auth', (data) => {
      this.authenticated = true;
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      localStorage.setItem('park_slots', JSON.stringify({ park_slots: 6 }));
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
      
      let available_park_slots = await availabe;

      if (available_park_slots > 0) {
        this.nav.navigateForward([ '/vacancies', { vacancies: JSON.stringify(vacancies) } ]);
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

  async logout() {
    if (localStorage.getItem('ticket') != null && localStorage.getItem('ticket') != undefined) {
      const alert = await this.alertController.create({
        header: `Ops..`,
        message: 'Você tem um ticket em andamento, finalize-o antes de terminar a sessão.',
        buttons: ['OK']
      });
      await alert.present();
    } else {
      this.loader('Saindo...');
      setTimeout(() => {
        this.loader('dismiss');
        localStorage.removeItem('token');
        localStorage.removeItem('user'); 
        this.nav.navigateForward('/login');
        this.authenticated = false;
      }, 1500);
    }    
  }

  async operation() {
    this.basic_alert('Funcionamento', 'Segunda a sábado: 10h às 22h Domingo e feriados: 14h às 20h');
  }

  async prices() {
    this.basic_alert('Preços', 'Até 30 minutos é GRATUITO. Primeira hora é R$ 10,00. Demais horas R$ 5,00 (cada).');
  }

  async consult_ticket() {
    this.events.publish('consult_ticket');
  }

  async login() {
    this.nav.navigateForward('/login');
  }

  async billing() {
    this.nav.navigateForward('/billings');
  }

  async basic_alert(title, content) {
    const alert = await this.alertController.create({
      header: title,
      message: content,
      buttons: ['Entendi']
    });
    await alert.present();
  }
}

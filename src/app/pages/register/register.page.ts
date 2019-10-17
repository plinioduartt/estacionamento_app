import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, LoadingController, AlertController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators }  from '@angular/forms';
import { WebserviceService } from '../../services/webservice.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
	group: FormGroup;
  form: any = {};
  loading: any;
  confirm_password: any;

  constructor(
    public menu: MenuController, 
    public nav: NavController, 
    private formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, 
    public ws: WebserviceService,
    public auth: AuthService,
    public alertController: AlertController
  ) 
  {
    this.validate();
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
      name: ["", Validators.required],
      username: ["", Validators.required],
      password: ["", Validators.required],
      confirm_password: ["", Validators.required],
      phone: ["", Validators.required]
    });
  }

  ngOnInit() {
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    this.menu.enable(true);
  }

  nav_to(page) {
    this.nav.navigateForward(page);
  }

  async register() {
    if (this.form.password !== this.confirm_password) {
      const alert = await this.alertController.create({
        header: `Ops...`,
        message: 'Senhas não correspondem, tente novamente.',
        buttons: ['OK']
      });
      await alert.present();
    } else {
      this.loader('Cadastrando dados...');
      this.ws.post('users', this.form).subscribe( async (res: any) => {
        this.loader('dismiss');
        this.loader('Autenticando...');
        let user = JSON.parse(res['_body']).user;
        console.log(user);
        this.auth.login({ username: user.username, password: this.form.password }).then( async (res: any) => {
          this.loader('dismiss');
          res = await JSON.parse(res['_body']);
          console.log(res);
          if (res.token !== null && res.token !== undefined) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', user.username);
            this.nav.navigateForward('/home');
          }
        });
      }, async (err) => {
        this.loader('dismiss');
        if (err.status == 401) {
          const alert = await this.alertController.create({
            header: `Ops...`,
            message: 'Este usuário já existe, tente outro.',
            buttons: ['OK']
          });
          await alert.present();
        }        
      });
    }    
  }
  
}

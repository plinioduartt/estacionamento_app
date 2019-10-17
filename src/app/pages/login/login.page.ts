import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, LoadingController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators }  from '@angular/forms';
import { WebserviceService } from '../../services/webservice.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  group: FormGroup;
  form: any = {};
  loading: any;

  constructor(
    public menu: MenuController,
    public nav: NavController,
    private formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, 
    public ws: WebserviceService,
    public auth: AuthService
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
      username: ["", Validators.required],
      password: ["", Validators.required],
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

  async login() {
    this.loader('Autenticando...');
    this.auth.login({ username: this.form.username, password: this.form.password }).then( async (res: any) => {
      this.loader('dismiss');
      res = await JSON.parse(res['_body']);
      if (res.token !== null && res.token !== undefined) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.nav.navigateForward('/home');
      }
    });
  }

}

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
  },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'register', loadChildren: './pages/register/register.module#RegisterPageModule' },
  { path: 'my-tickets', loadChildren: './pages/my-tickets/my-tickets.module#MyTicketsPageModule' },
  { path: 'operation', loadChildren: './pages/operation/operation.module#OperationPageModule' },
  { path: 'prices', loadChildren: './pages/prices/prices.module#PricesPageModule' },
  { path: 'billings', loadChildren: './pages/billings/billings.module#BillingsPageModule' },
  { path: 'vacancies', loadChildren: './pages/vacancies/vacancies.module#VacanciesPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

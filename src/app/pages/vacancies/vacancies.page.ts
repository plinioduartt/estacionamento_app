import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vacancies',
  templateUrl: './vacancies.page.html',
  styleUrls: ['./vacancies.page.scss'],
})
export class VacanciesPage implements OnInit {
  itens = [];
  constructor(private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe( async (params) => {
      console.log(JSON.parse(params.vacancies))
      this.itens = JSON.parse(params.vacancies);
      console.log('this.itens', this.itens)
    });
  }

  ngOnInit() {
  }

}

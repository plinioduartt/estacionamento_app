import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VacanciesPage } from './vacancies.page';

describe('VacanciesPage', () => {
  let component: VacanciesPage;
  let fixture: ComponentFixture<VacanciesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VacanciesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VacanciesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingsPage } from './billings.page';

describe('BillingsPage', () => {
  let component: BillingsPage;
  let fixture: ComponentFixture<BillingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

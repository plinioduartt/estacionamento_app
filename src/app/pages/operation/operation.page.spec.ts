import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationPage } from './operation.page';

describe('OperationPage', () => {
  let component: OperationPage;
  let fixture: ComponentFixture<OperationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

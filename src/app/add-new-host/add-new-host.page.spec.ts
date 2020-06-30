import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewHostPage } from './add-new-host.page';

describe('AddNewHostPage', () => {
  let component: AddNewHostPage;
  let fixture: ComponentFixture<AddNewHostPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewHostPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewHostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

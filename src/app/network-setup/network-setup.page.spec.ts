import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkSetupPage } from './network-setup.page';

describe('NetworkSetupPage', () => {
  let component: NetworkSetupPage;
  let fixture: ComponentFixture<NetworkSetupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkSetupPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkSetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

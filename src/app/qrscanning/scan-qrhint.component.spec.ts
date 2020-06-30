import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanQRHintPage } from './scan-qrhint.page';

describe('ScanQRHintPage', () => {
  let component: ScanQRHintPage;
  let fixture: ComponentFixture<ScanQRHintPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScanQRHintPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanQRHintPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

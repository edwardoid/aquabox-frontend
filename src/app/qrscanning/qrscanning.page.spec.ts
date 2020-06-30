import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QSScanningPage } from './qrscanning.page';

describe('QRScanningPage', () => {
  let component: QRScanningPage;
  let fixture: ComponentFixture<QRScanningPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QRScanningPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QRScanningPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

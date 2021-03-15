import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RelayActionComponent } from './relay-action.component';

describe('RelayActionComponent', () => {
  let component: RelayActionComponent;
  let fixture: ComponentFixture<RelayActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelayActionComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RelayActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

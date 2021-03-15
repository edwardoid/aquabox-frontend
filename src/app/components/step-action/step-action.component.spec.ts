import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StepActionComponent } from './step-action.component';

describe('StepActionComponent', () => {
  let component: StepActionComponent;
  let fixture: ComponentFixture<StepActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepActionComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StepActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

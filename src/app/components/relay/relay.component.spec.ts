import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RelayComponent } from './relay.component';

describe('RelayComponent', () => {
  let component: RelayComponent;
  let fixture: ComponentFixture<RelayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelayComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RelayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

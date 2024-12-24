import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddNewHostPage } from './add-new-host.page';

describe('AddNewHostPage', () => {
  let component: AddNewHostPage;
  let fixture: ComponentFixture<AddNewHostPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddNewHostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

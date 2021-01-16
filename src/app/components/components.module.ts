import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RelayComponent } from './relay/relay.component'
import { StepComponent } from './step/step.component';



@NgModule({
  declarations: [ RelayComponent, StepComponent ],
  exports: [ RelayComponent, StepComponent ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
  ]
})
export class ComponentsModule { }

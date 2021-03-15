import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RelayComponent } from './relay/relay.component'
import { StepComponent } from './step/step.component';
import { RelayActionComponent } from './relay-action/relay-action.component';
import { StepActionComponent } from './step-action/step-action.component';

@NgModule({
  declarations: [ RelayComponent, RelayActionComponent, StepComponent, StepActionComponent ],
  exports: [ RelayComponent, RelayActionComponent, StepComponent, StepActionComponent ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ComponentsModule { }

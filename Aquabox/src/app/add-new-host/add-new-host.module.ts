import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddNewHostPageRoutingModule } from './add-new-host-routing.module';

import { AddNewHostPage } from './add-new-host.page';
import { BarcodeScanningModalComponent } from '../barcode-scanning-modal/barcode-scanning-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddNewHostPageRoutingModule
  ],
  declarations: [AddNewHostPage, BarcodeScanningModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddNewHostPageModule {}

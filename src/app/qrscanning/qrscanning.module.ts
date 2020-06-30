import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { QRScanningPage } from './qrscanning.page';
import { ScanQRHintComponent } from './scan-qrhint.component';

const routes: Routes = [
  {
    path: '',
    component: QRScanningPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [QRScanningPage, ScanQRHintComponent],
  entryComponents: [ScanQRHintComponent]
})
export class QRScanningPageModule {}

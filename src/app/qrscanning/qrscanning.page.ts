import { ScanService } from '../scanner.service';
import { Component, OnInit } from '@angular/core';
import { ToastController, PopoverController, NavController } from '@ionic/angular';
import { ScanQRHintComponent } from './scan-qrhint.component';

@Component({
  selector: 'app-qrscanning',
  templateUrl: './qrscanning.page.html',
  styleUrls: ['./qrscanning.page.scss'],
})
export class QRScanningPage implements OnInit {

  constructor(private scanner: ScanService,
              private navi: NavController,
              public toastController: ToastController,
              private popoverCtrl: PopoverController) {
    var self = this;
    this.scanner.setStatusUpdateListener(() => {
      self.canSwitchCamera = this.scanner.status.canChangeCamera;
    });
  }

  scanning: boolean = false;
  canSwitchCamera: boolean = false;

  ngOnInit() {
    this.scanner.updateCurrentStatus();
    this.scan();
  }

  ngOnDestroy() {
    this.scanner.stop();
    this.scanning = false;
  }

  async scan() {
    this.scanning = true;
    this.scanner.scan().then( async (result: string) => {
      this.scanner.stop();
      this.scanning = false;
      this.navi.back();
    })
  }

  async showHelp(ev: any) {
    const popover = await this.popoverCtrl.create({
        component: ScanQRHintComponent,
        event: ev,
        animated: true,
        showBackdrop: true,
        translucent: true
    });
    popover.style.setProperty("--background", "#00000085", "important");
    popover.style.setProperty("--box-shadow", "false", "important")
    return await popover.present();
}

  toggleFlash() {
    this.scanner.toggleLight();
  }

  toggleCamera() {
    this.scanner.toggleCamera();
  }
}

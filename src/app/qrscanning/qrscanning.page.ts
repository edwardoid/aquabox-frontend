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
  }

  scanning: boolean = false;

  ngOnInit() {
    this.scan();
  }

  ngOnDestroy() {
    this.scanner.stop();
    this.scanning = false;
    document.querySelector('body').classList.remove('scanner-active');
  }

  async scan() {
    document.querySelector('body').classList.add('scanner-active');
    this.scanning = true;
    this.scanner.scan().then( async () => {
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

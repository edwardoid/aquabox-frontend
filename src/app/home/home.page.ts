import { AquaBoxService } from './../aqua-box.service';
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  errorString: string = "Nothing";

  constructor(private nav: NavController,
    private aquabox: AquaBoxService,
    private qrScanner: QRScanner) {
  }

  ngOnInit() {
  }
  gotoDevices() {
    for (let k in this.aquabox.getHosts()) {
      this.nav.navigateForward("/devices/" + k);
    }
  }
  addNewDevice() {
    this.nav.navigateForward("/qrscanning");
  }
}

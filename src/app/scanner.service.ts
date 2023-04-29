import { Platform, NavController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class ScanService {
  constructor(
      private platform: Platform,
      private nav: NavController) {
      this.updateCurrentStatus();
      if(Capacitor.getPlatform() !== "web") {
        BarcodeScanner.prepare();
      }
  }

  public lastScannedText: string = undefined;
  private filter: (text: string) => boolean; 

  scanAndComeBack(callback: (text: string) => boolean) {
    this.filter = callback;
    this.nav.navigateForward("/qrscanning")
  }

  async toggleLight() {
    /*
    this.qrScanner.getStatus()
    .then((status: QRScannerStatus) => {
      if (!status.canEnableLight)
        return;
      
      let result: Promise<QRScannerStatus>;
      if (status.lightEnabled) 
        result = this.qrScanner.enableLight();
      else
        result = this.qrScanner.disableLight();

        var self = this;
        result.then((status: QRScannerStatus) => {
          self.status = status;
          if (self.statusUpdateListener) {
            self.statusUpdateListener();
          }
        });
    });*/
  }

  async toggleCamera() {
  }

  stop() {
    if(Capacitor.getPlatform() === "web") {
       return;
    }
    
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
  }

  updateCurrentStatus() {
    var self = this;
  }

  async scan() {

    if(Capacitor.getPlatform() === "web") {
      this.lastScannedText = "1213;1214;testDev;abtest;16";
      this.filter(this.lastScannedText);
    } else {
    
      await BarcodeScanner.checkPermission({ force: true });


      this.lastScannedText = undefined;
      
      BarcodeScanner.hideBackground();
      let result = await BarcodeScanner.startScan({ targetedFormats: [ SupportedFormat.QR_CODE ] });
      while(!this.filter(result.content)) {
        result = await BarcodeScanner.startScan({ targetedFormats: [ SupportedFormat.QR_CODE ] });
      }
      this.lastScannedText = result.content;
    }
  }

}
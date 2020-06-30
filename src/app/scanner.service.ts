import { Injectable } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';


@Injectable({
  providedIn: 'root'
})
export class ScanService {
  constructor(
    private qrScanner: QRScanner) {
      this.updateCurrentStatus();
  }

  public status: QRScannerStatus;
  private statusUpdateListener: () => void;

  setStatusUpdateListener(listener: () => void) {
    this.statusUpdateListener = listener;
  }

  async toggleLight() {
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
    });
  }

  async toggleCamera() {
    this.qrScanner.getStatus()
    .then((status: QRScannerStatus) => {
      if (!status.canChangeCamera)
        return;
      
      var self = this;
      this.qrScanner.useCamera((status.currentCamera + 1) % 2)
        .then((status: QRScannerStatus) => {
          self.status = status;
          if (self.statusUpdateListener) {
            self.statusUpdateListener();
          }
        });
    });
  }

  stop() {
    this.qrScanner.hide();
    this.qrScanner.destroy();
  }

  updateCurrentStatus() {
    var self = this;
    return this.qrScanner.getStatus()
    .then((status: QRScannerStatus) => {
      self.status = status;
      if (self.statusUpdateListener) {
        self.statusUpdateListener();
      }
    });
  }

  scan(): Promise<any> {
    var self = this;
    // Optionally request the permission early
    return this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        self.status = status;
        return new Promise((resolve, reject) => {
          if (status.authorized) {
            // camera permission was granted

              let scanSub = this.qrScanner.scan().subscribe((text: string) => {

              this.qrScanner.hide(); // hide camera preview
              scanSub.unsubscribe(); // stop scanning

              resolve(text);
            });

            this.qrScanner.show();
            this.updateCurrentStatus();
          } else if (status.denied) {
            this.qrScanner.openSettings();
            reject(new Error('MESSAGES.QRSCANNER.CHANGE_SETTINGS_ERROR'));
          } else {
            reject(new Error('MESSAGES.QRSCANNER.PERMISSION_DENIED_ERROR'));
          }
        })
      })
  }

}
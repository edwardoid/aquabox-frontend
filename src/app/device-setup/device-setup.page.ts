import { HostsMap } from './../id-map';
import { ActivatedRoute } from '@angular/router';
import { AquaBoxService } from './../aqua-box.service';
import { Device } from '../device';
import { NavController, AlertController } from '@ionic/angular';
import { Aquabox } from './../aquabox';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-device-setup',
  templateUrl: './device-setup.page.html',
  styleUrls: ['./device-setup.page.scss'],
})
export class DeviceSetupPage implements OnInit {

  private box: Aquabox;
  public device: Device
  
  name: string = "Device"
  type: string = "generic"
  vendor: string = "other"
  model: string = ""

  constructor(private navi: NavController,
              private aquabox: AquaBoxService,
              private alertController: AlertController,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    let boxId = this.route.snapshot.paramMap.get("box");
    let devId = this.route.snapshot.paramMap.get("dev");
    let self = this;
    this.aquabox.getHosts((hosts: HostsMap) => {
      self.box = hosts.find(boxId);
      if (self.box) {
        self.device = this.box.devices.find(devId);
        if (!this.device)
          self.navi.navigateRoot("/home");
          self.name = self.device.name;
          self.type = self.device.type;
          if (self.device.meta["vendor"])
            self.vendor = self.device.meta["vendor"];
          if (self.device.meta["model"])
            self.model = self.device.meta["model"];  
      } else {
        self.navi.navigateRoot("/home");
      }
    });
  }

  async save() {
    const alert = await this.alertController.create({
      header: "Can't update device information",
      message: "Something went wrong. Please try again later or restart the box",
      buttons: [ 'OK' ]
    });

    let n = this.device.name;
    let t = this.device.type;
    let m = this.device.meta;
    this.device.name = this.name;
    this.device.type = this.type;
    this.device.meta["model"] = this.model;
    this.device.meta["vendor"] = this.vendor;
    this.aquabox.updateDevice(this.box, this.device,
    (ok: boolean) => {
      if (ok) {
        this.navi.back();
      } else {
        this.device.name = n;
        this.device.meta = m;
        this.device.type = t;
        alert.present();
      }
    });
  }
}

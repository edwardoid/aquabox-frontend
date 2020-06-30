import { HostsMap } from './../id-map';
import { ActivatedRoute } from '@angular/router';
import { AquaBoxService } from './../aqua-box.service';
import { Device } from '../device';
import { NavController } from '@ionic/angular';
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
  type: string = "other"
  model: string = "other"
  addditional: string = ""

  constructor(private navi: NavController,
              private aquabox: AquaBoxService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    let boxId = this.route.snapshot.paramMap.get("box");
    let devId = this.route.snapshot.paramMap.get("dev");
    let self = this;
    this.aquabox.getHosts((hosts: HostsMap) => {
      self.box = hosts.find(boxId);
      if (this.box) {
        self.device = this.box.devices.find(devId);
        if (!this.device)
          self.navi.navigateRoot("/home");
        self.name = self.device.name;
      } else {
        self.navi.navigateRoot("/home");
      }
    });
  }

  save() {

  }
}

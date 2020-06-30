import { HostsMap, DevicesMap } from './../id-map';
import { AquaBoxService } from './../aqua-box.service';
import { Component, OnInit } from '@angular/core';
import { Device } from '../device';
import { LoadingController, NavController } from '@ionic/angular';
import { Aquabox } from '../aquabox';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: 'devices.page.html',
  styleUrls: ['devices.page.scss']
})
export class DevicesPage implements OnInit {

  devices: DevicesMap;
  box: Aquabox;
  
  constructor(private navi: NavController,
              private route: ActivatedRoute,
              private loadingController: LoadingController,
              private aquabox: AquaBoxService) {
    let boxId = this.route.snapshot.paramMap.get('box');
    this.aquabox.getHosts((hosts: HostsMap) => {
      this.box = hosts.find(boxId);
      if (this.box)
        this.getDevices(undefined);
      else
        this.navi.navigateRoot("/home");
    });
  }

  ngOnInit() {
  }

  openRules(dev: Device) {
    this.navi.navigateForward("/rules/" + this.box.configuration.id + "/" + dev.id);
  }

  async getDevices(event) {
    const loading = await this.loadingController.create({
      message: "Loading devices...",
      duration: 30000
    });

    let self = this;
    await loading.present().then(() => {

      self.box.getDevices(
        (devices: DevicesMap) => {
          self.devices = devices;
          loading.dismiss();
          if (event)
            event.target.complete();
        },
        () => {
          loading.dismiss();
          if (event)
            event.target.complete();
        }
      );
    });
  }
}

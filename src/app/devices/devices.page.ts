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

  devices: Array<Device> = [];
  box: Aquabox;
  
  constructor(private navi: NavController,
              private route: ActivatedRoute,
              private loadingController: LoadingController,
              private aquabox: AquaBoxService) {
  }

  async ngOnInit() {
    let boxId = this.route.snapshot.paramMap.get('box');
    this.box = this.aquabox.getHosts()[boxId];
    this.getDevices(undefined);
  }

  openRules(dev: Device) {
    this.navi.navigateForward("/rules/" + this.box.id + "/" + dev.id);
  }

  async getDevices(event) {
    const loading = await this.loadingController.create({
      message: "Loading devices...",
      duration: 30000
    });

    await loading.present().then(() => {

      this.box.getDevices(
        (devices: Device[]) => {
          this.devices = devices;
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

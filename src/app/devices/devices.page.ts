import { UpdateEvent } from './../update-event';
import { HostsMap, DevicesMap } from './../id-map';
import { AquaBoxService } from './../aqua-box.service';
import { Component, OnInit } from '@angular/core';
import { Device } from '../device';
import { LoadingController, NavController, AlertController } from '@ionic/angular';
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
    public alertController: AlertController,
    private aquabox: AquaBoxService) {
    let boxId = this.route.snapshot.paramMap.get('box');
    this.aquabox.getHosts((hosts: HostsMap) => {
      this.box = hosts.find(boxId);
      if (this.box)
        this.getDevices(undefined);
      else
        this.navi.navigateRoot("/home");
    });

    this.aquabox.Updates.subscribe((event: UpdateEvent) => {
      if (event.Box != boxId) {
        return;
      }
      if (event.Class != UpdateEvent.Device) {
        return;
      }

      if (!this.devices.contains(event.Sender)) {
        return;
      }

      event.apply(this.devices.find(event.Sender))
    });
  }

  ngOnInit() {
  }

  openRules(dev: Device) {
    this.navi.navigateForward("/rules/" + this.box.configuration.id + "/" + dev.id);
  }

  async toggleDeviceIfRulesAreDisabled(dev: Device) {
    if (dev.rulesEnabled) {
      dev.isOn = !dev.isOn;
      const alert = await this.alertController.create({
        header: "Disable applying rules",
        message: "Device <strong>" + dev.name + "</strong> is enabled for rules. " +
                 "To control it manually applying rules on it must be disabled. " +
                 "Do you want to disable rules on <strong>" + dev.name + "</strong>",
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => { 
            }
          },
          {
            text: 'Okay',
            handler: () => {
              dev.rulesEnabled = false;
              dev.update((ok: boolean) => {
                dev.rulesEnabled = !ok;
                this.toggleDevice(dev);
              });
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.toggleDevice(dev);
    }
  }

  enableRulesOn(dev) {
    dev.rulesEnabled = true;
    dev.update((ok: boolean) => {
      dev.rulesEnabled = ok;
    });
  }

  toggleDevice(dev: Device) {
    if (dev.isOn)
      dev.turnOff();
    else
      dev.turnOn();
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

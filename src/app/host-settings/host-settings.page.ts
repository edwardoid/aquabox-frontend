import { AquaBoxConfiguration, Aquabox } from './../aquabox';
import { AquaBoxService } from './../aqua-box.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { toCanvas } from 'qrcode';
import { NetworkStatus } from '../box-status';

@Component({
  selector: 'app-host-settings',
  templateUrl: './host-settings.page.html',
  styleUrls: ['./host-settings.page.scss'],
})
export class HostSettingsPage implements OnInit {
  configuration: AquaBoxConfiguration = new AquaBoxConfiguration();
  box: Aquabox = null;
  
  @ViewChild('qrCanvas')
  qrCanvas: ElementRef;
  constructor(private navi: NavController,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    public alertController: AlertController,
    private aquabox: AquaBoxService
  ) {
    let boxId = this.route.snapshot.paramMap.get('box');
    if (!this.aquabox.hosts.contains(boxId)) {
      this.navi.back();
    }
  }

  ngOnInit() {
    let boxId = this.route.snapshot.paramMap.get('box');
    this.box = this.aquabox.hosts.find(boxId);
    let src = this.box.configuration;
    this.configuration.id = src.id;
    this.configuration.api = src.api;
    this.configuration.host = src.host;
    this.configuration.name = src.name;
    this.configuration.protocol = src.protocol;
    this.configuration.rest = src.rest;
    this.configuration.stream = src.stream;
    this.configuration.serial = src.serial;
  }

  ngAfterViewInit() {
    this.redrawQR();
  }

  redrawQR() {
    toCanvas(this.qrCanvas.nativeElement, JSON.stringify({ "aquabox" : this.configuration }), { }, undefined);
  }

  selectNetwork() {
    this.navi.navigateForward("/network/" + this.route.snapshot.paramMap.get('box'));
  }

  save() {
    this.aquabox.deleteHost(this.configuration);
    this.aquabox.addHost(this.configuration);
    this.navi.navigateRoot("/home");
  }

  async test() {
    const testing = await this.loadingController.create({
      message: "Testing settings...",
      duration: 30000
    });

    let self = this;
    let result = false;
    await testing.present().then(() => {
      self.aquabox.testConfiguration(self.configuration, async (ok: boolean) => {
        result = ok;
        testing.dismiss();
        const alert = await self.alertController.create({
          header: 'Network settings',
          message: result ? 'New configuration can be applied.'
            : 'Looks like aquabox is not reachable. Check settings you have changed. Check if device is on and connected to the network',
          buttons: ['OK']
        });

        await alert.present();
      })
    });
  }

  async delete() {
    let self = this;
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message: 'You are goint to <strong>DELETE ' + self.configuration.name + ' </strong>. This is not revertable operation!',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {}
          },
          {
            text: 'YES! Delete!',
            handler: () => {
              self.aquabox.deleteHost(self.configuration);
              self.navi.navigateRoot("/home");
            }
          }
        ]
    });

    await alert.present();
  }
}

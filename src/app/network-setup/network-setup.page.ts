import { AquaBoxService } from './../aqua-box.service';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController } from '@ionic/angular';
import { Aquabox } from './../aquabox';
import { Component, OnInit } from '@angular/core';
import { WiFiInfo } from '../wi-fi-info';

@Component({
  selector: 'app-network-setup',
  templateUrl: './network-setup.page.html',
  styleUrls: ['./network-setup.page.scss'],
})
export class NetworkSetupPage implements OnInit {

  box: Aquabox = null;
  networks: WiFiInfo[] = [];

  constructor(private navi: NavController,
    private loadingController: LoadingController,
    private route: ActivatedRoute,
    private aquabox: AquaBoxService
  ) {
    let boxId = this.route.snapshot.paramMap.get('box');
    if (!this.aquabox.hosts.contains(boxId)) {
      this.navi.back();
    }

    this.box = this.aquabox.hosts.find(boxId);
  }

  ngOnInit() {
    let boxId = this.route.snapshot.paramMap.get('box');
    if (!this.aquabox.hosts.contains(boxId)) {
      this.navi.back();
    }

    this.box = this.aquabox.hosts.find(boxId);
    this.scan(null);
  }

  icon(strength: number) {
    return Math.floor(strength / 30.);
  }

  async scan(event) {
    const loading = await this.loadingController.create({
      message: "Scanning for WiFi networks...",
      duration: 30000
    });

    let self = this;
    await loading.present().then(() => {

      self.box.getNetworks(
        (networks: WiFiInfo[]) => {
          this.networks = networks;

          loading.dismiss();
          if (event)
            event.target.complete();
        }
      );
    });
  }
}

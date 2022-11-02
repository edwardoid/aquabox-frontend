import { AquaboxInstance } from '../aquabox-instance';
import { HostsMap } from './../id-map';
import { AquaBoxService } from './../aqua-box.service';
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  errorString: string = "Nothing";

  constructor(private nav: NavController,
              public aquabox: AquaBoxService) {
  }

  ngOnInit() {
  }
  
  addNewDevice() {
    this.nav.navigateForward("/add-new-host");
  }

  gotoDevice(host: AquaboxInstance) {
    if (host.connected)
      this.nav.navigateForward("/devices/" + host.id);
  }

  openSettings(host: AquaboxInstance) {
    this.nav.navigateForward("/settings/" + host.id);
  }
}

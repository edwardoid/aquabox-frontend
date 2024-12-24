import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AquaBoxService } from './../aqua-box.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private nav: NavController,
              public aquabox: AquaBoxService) {}

  addNewDevice() {
    this.nav.navigateForward("/add-new-host");
  }
}

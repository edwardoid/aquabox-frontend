import { AquaboxInstance } from '../aquabox-instance';
import { HostsMap } from './../id-map';
import { AquaBoxService } from './../aqua-box.service';
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-version',
  templateUrl: 'version.page.html',
  styleUrls: ['version.page.scss'],
})
export class VersionPage {

  errorString: string = "Nothing";

  constructor(private nav: NavController) {
  }

  ngOnInit() {
  }
}

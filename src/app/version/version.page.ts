import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GlobalSettings, AquaBoxService } from '../aqua-box.service';

@Component({
  selector: 'app-version',
  templateUrl: 'version.page.html',
  styleUrls: ['version.page.scss'],
})
export class VersionPage {

  errorString: string = "Nothing";
  settings: GlobalSettings

  constructor(private nav: NavController,
              public aquabox: AquaBoxService) {
    this.settings = aquabox.settings()
  }

  ngOnInit() {
  }

  save() {
    console.log("OK: " + this.settings.cloudEnabled + " <- " + this.aquabox.settings().cloudEnabled)
    this.aquabox.saveSettings(this.settings)
  }
}

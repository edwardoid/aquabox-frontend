import { Component, Input, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { TranslatorService } from 'src/app/translator.service';
import { Device } from '../../device';


@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
})
export class StepComponent implements OnInit {

  @Input() box: string;
  @Input() dev: Device;
  constructor(
    private tr: TranslatorService,
    public alertController: AlertController,
    private navi: NavController
  ) { }

  ngOnInit() { }

  enableRulesOn(dev) {
    dev.rulesEnabled = true;
    dev.update((ok: boolean) => {
      dev.rulesEnabled = ok;
    });
  }

  setSteps(dev: Device, count: number) {
    dev.setValue("times", count)
  }
  openRules(dev: Device) {
    this.navi.navigateForward("/rules/" + this.box + "/" + this.dev.id);
  }

  setupDevice(dev) {
    this.navi.navigateForward("/device-setup/" + this.box + "/" + this.dev.id);
  }

}

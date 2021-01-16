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
  openRules(dev: Device) {
    this.navi.navigateForward("/rules/" + this.box + "/" + this.dev.id);
  }

  setupDevice(dev) {
    this.navi.navigateForward("/device-setup/" + this.box + "/" + this.dev.id);
  }

}

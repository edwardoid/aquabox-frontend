import { Component, Input, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AquaBoxService } from 'src/app/aqua-box.service';
import { TranslatorService } from 'src/app/translator.service';
import { UpdateEvent } from 'src/app/update-event';
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
    private navi: NavController,
    private aquabox: AquaBoxService
  ) {
    this.aquabox.Updates.subscribe((event: UpdateEvent) => {
      if (event.Box != this.box) {
          return;
      }
      if (event.Class != UpdateEvent.Device) {
          return;
      }

      if (this.dev.id === event.Sender) {
        event.apply(this.dev)
      }
      if (this.dev.times != 0 && this.max == 0) {
        this.max = this.dev.times;
      } else {
        this.current = this.dev.times;
      }
      if (this.dev.times == 0) {
        this.max = 0;
        this.current = 0;
        this.progress = 1;
      } else {
        this.progress = (this.max - this.current) / this.max
      }
  });
  }

  private max: number = 0;
  private current: number = 0;
  private progress: number = 0;

  ngOnInit() {
    this.max = this.dev.times;
    this.current = this.dev.times;
    this.progress = 1;
  }

  enableRulesOn(dev) {
    dev.rulesEnabled = true;
    dev.update((ok: boolean) => {
      dev.rulesEnabled = ok;
    });
  }

  setSteps(dev: Device, count: number) {
    dev.setValue("times", count)
    this.max = count;
    this.current = dev.times;
    this.progress = 0;
  }
  openRules(dev: Device) {
    this.navi.navigateForward("/rules/" + this.box + "/" + this.dev.id);
  }

  setupDevice(dev) {
    this.navi.navigateForward("/device-setup/" + this.box + "/" + this.dev.id);
  }

}

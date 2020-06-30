import { AquaBoxConfiguration } from './../aquabox';
import { AquaBoxService } from './../aqua-box.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, IonSlides, IonButton } from '@ionic/angular';
import { ScanService } from '../scanner.service';

@Component({
  selector: 'app-add-new-host',
  templateUrl: './add-new-host.page.html',
  styleUrls: ['./add-new-host.page.scss'],
})
export class AddNewHostPage implements OnInit {

  public configuration: AquaBoxConfiguration = undefined
  public ready: boolean = false
  public name: string = ""
  public sliderIndex: number = 0;

  sliderOpts = {
    allowTouchMove: false,
    loop: false
  }

  @ViewChild('slides') slides: IonSlides;
  @ViewChild('doneButton') doneButton: IonButton;

  constructor(private nav: NavController,
              private scanner: ScanService,
              private aquabox: AquaBoxService) {
  }

  ngOnInit() {
    this.slides.getActiveIndex()
      .then((idx: number) => {
        this.sliderIndex = idx;
      });

    this.slides.slideTo(0);
    this.ready = this.name.length > 3 && this.configuration != undefined;
  }

  nameChanged(event: any) {
    this.name = event.target.value;
    this.ready = this.name.length > 3 && this.configuration != undefined && !this.aquabox.hosts.contains(this.name)
    this.doneButton.disabled = !this.ready;
  }

  addDevice() {
    if (this.configuration === undefined) {
      return;
    }
    this.configuration.id = this.name
    this.aquabox.addHost(this.configuration);
    this.configuration = undefined;
    this.nav.navigateRoot("/home");
    this.nav.pop();
  }

  next() {
    this.slides.slideNext();
    this.sliderIndex++;
    this.slides.getActiveIndex()
      .then((idx: number) => {
        this.sliderIndex = idx;
      });
  }

  scan() {
    var self = this
    this.scanner.scanAndComeBack((text) => {
      try {
        let status: Object = JSON.parse(text);
        if (!status.hasOwnProperty("aquabox"))
          return false;
        
        let cfg = status["aquabox"]
        if (cfg != undefined &&
            cfg.host != undefined &&
            cfg.port != undefined &&
            cfg.port > 0 &&
            cfg.host.length > 0) {
          this.configuration = cfg;
          this.configuration.api = "v1";
          this.configuration.protocol = "http";
          this.configuration.hostname = cfg.host;
          this.configuration.host = cfg.host;
          this.slides.lockSwipeToNext
          this.slides.slideTo(3);
          return true;
        }
      } catch (e) {
        return false;
      }

      return false;
    });
  }
}

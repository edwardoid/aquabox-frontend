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
    this.configuration.id = Date.now().toString();
    this.configuration.name = this.name;
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
    this.scanner.scanAndComeBack((text) => {
        try {
            let tokens = text.split(';');

            if (tokens.length > 4) {
                this.configuration = new AquaBoxConfiguration();
                this.configuration.api = "v1";
                this.configuration.protocol = "http";
                this.configuration.rest = parseInt(tokens[0]);
                this.configuration.stream = parseInt(tokens[1]);
                this.configuration.serial = tokens[2];
                this.configuration.name = tokens[4];
                this.configuration.host = tokens[4];
                
                for (let h of this.aquabox.hosts) {
                    if (h.configuration.host == this.configuration.host) {
                        return false;
                    }
                }
                this.slides.slideTo(3);

                return true;
            }
        } catch (e) {
            this.configuration = undefined;
            return false;
        }
        this.configuration = undefined;
      return false;
    });
  }
}

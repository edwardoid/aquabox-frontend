import { AquaBoxConfiguration } from './../aquabox';
import { Component, OnInit, ViewChild } from '@angular/core'
import { NavController, IonButton } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AquaBoxService } from '../aqua-box.service';
import { ScanService } from '../scan.service';
import { UpdateEvent } from '../update-event';
import { SwiperContainer } from 'swiper/element';

@Component({
    selector: 'app-add-new-host',
    templateUrl: './add-new-host.page.html',
    styleUrls: ['./add-new-host.page.scss'],
})
export class AddNewHostPage implements OnInit {

    public configuration: AquaBoxConfiguration = new AquaBoxConfiguration;
    public ready: boolean = false
    public name: string = ""
    public sliderIndex: number = 0

    sliderOpts = {
        allowTouchMove: false,
        loop: false
    }

    @ViewChild('slides')
    private slides!: SwiperContainer;

    @ViewChild('doneButton')
    private doneButton!: IonButton;

    constructor(private nav: NavController,
        private route: ActivatedRoute,
        private scanner: ScanService,
        private aquabox: AquaBoxService) {

        let boxId = this.route.snapshot.paramMap.get('box');
        aquabox.Updates.subscribe(
            (event: UpdateEvent) => {
                if (event.Box != boxId) {
                    return;
                }
                if (event.Class != UpdateEvent.Aquabox) {
                    return;
                }
            }
        )
    }

    ngOnInit() {
        this.ready = false;
    }

    ngAfterViewInit() {
        //this.slides.slideTo(0, 0, false);
        this.slides.tabIndex = 0;
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
        this.configuration = new AquaBoxConfiguration();
        this.nav.navigateRoot("/home");
        this.nav.pop();
    }

    next() {
        // this.slides.slideNext();
        // this.sliderIndex++;
        // this.slides.getActiveIndex()
        //     .then((idx: number) => {
        //         this.sliderIndex = idx;
        //     });
    }

    scan() {
        /*
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
                    this.configuration.name = tokens[3];
                    this.configuration.host = tokens[3];

                    for (let h of this.aquabox.hosts) {
                        if (h.configuration.host == this.configuration.host) {
                            return false;
                        }
                    }
                    this.slides.slideTo(3);

                    return true;
                }
            } catch (e) {
                this.configuration = new AquaBoxConfiguration();
                return false;
            }
            this.configuration = new AquaBoxConfiguration();
            return false;
        });*/
    }
}

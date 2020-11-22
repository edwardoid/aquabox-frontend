//import { NetworkAuthentificationComponent } from './../network-authentification/network-authentification.component';
import { WiFiInfo } from './../wi-fi-info';
import { AquaBoxService } from './../aqua-box.service';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, ModalController, IonButton, IonSlides } from '@ionic/angular';
import { Aquabox } from './../aquabox';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-network-setup',
    templateUrl: './network-setup.page.html',
    styleUrls: ['./network-setup.page.scss'],
})
export class NetworkSetupPage implements OnInit {

    box: Aquabox = null;
    networks: WiFiInfo[] = [];
    password: string
    ssid: string

    sliderOpts = {
        allowTouchMove: false,
        loop: false
    }

    @ViewChild('slides') slides: IonSlides;
    @ViewChild('connectButton') connectButton: IonButton;

    constructor(private navi: NavController,
        private loadingController: LoadingController,
        private route: ActivatedRoute,
        private aquabox: AquaBoxService,
        private modalController: ModalController
    ) {
        let boxId = this.route.snapshot.paramMap.get('box');
        if (!this.aquabox.hosts.contains(boxId)) {
            this.navi.back();
        }

        this.box = this.aquabox.hosts.find(boxId);
    }

    ngOnInit() {
        let boxId = this.route.snapshot.paramMap.get('box');
        if (!this.aquabox.hosts.contains(boxId)) {
            this.navi.back();
        }

        this.slides.slideTo(0);

        this.box = this.aquabox.hosts.find(boxId);
        this.box.getNetworks((nets: WiFiInfo[]) => {
            this.networks = nets;
        });
    }

    nameChanged(event: any) {
        this.password = event.target.value;
        this.connectButton.disabled = this.password.length < 8;
    }

    connectTo(net: WiFiInfo) {
        this.ssid = net.SSID;
        this.slides.slideTo(1);
    }

    icon(strength: number) {
        return Math.floor(strength / 30.);
    }

    async scan(event) {
        const loading = await this.loadingController.create({
            message: "Scanning for WiFi networks...",
            duration: 30000
        });

        let self = this;
        await loading.present().then(() => {

            self.box.scanForNetworks(
                (ok: boolean) => {
                    if (!ok) {
                        loading.dismiss();
                        if (event)
                            event.target.complete();
                        return;
                    }
                    self.box.getNetworks((networks: WiFiInfo[]) => {
                        this.networks = networks;

                        loading.dismiss();
                        if (event)
                            event.target.complete();
                    });
                }
            );
        });
    }

    async doConnect() {
        this.slides.slideTo(2);
    }

    async authentificate(network: WiFiInfo) {
        /*const modal = await this.modalController.create({
          component: NetworkAuthentificationComponent,
          componentProps: {
            'ssid': network.SSID,
            'boxId': this.box.id
          }
        });
        return await modal.present();
        */
    }
}

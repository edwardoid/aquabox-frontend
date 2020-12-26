//import { NetworkAuthentificationComponent } from './../network-authentification/network-authentification.component';
import { WiFiInfo } from './../wi-fi-info';
import { AquaBoxService } from './../aqua-box.service';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, ModalController, IonButton, IonSlides } from '@ionic/angular';
import { Aquabox } from './../aquabox';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Security } from '../Security';

@Component({
    selector: 'app-network-setup',
    templateUrl: './network-setup.page.html',
    styleUrls: ['./network-setup.page.scss'],
})
export class NetworkSetupPage implements OnInit {

    box: Aquabox = null;
    networks: WiFiInfo[] = [];
    password: string
    selectedNetwork: WiFiInfo
    boxId: string

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
        this.boxId = this.route.snapshot.paramMap.get('box');
        if (!this.aquabox.hosts.contains(this.boxId)) {
            this.navi.back();
        }

        this.box = this.aquabox.hosts.find(this.boxId);
    }

    ngOnInit() {
        this.boxId = this.route.snapshot.paramMap.get('box');
        if (!this.aquabox.hosts.contains(this.boxId)) {
            this.navi.back();
        }
    }

    ngAfterViewInit() {
        this.slides.slideTo(0);

        this.box = this.aquabox.hosts.find(this.boxId);
        this.box.getNetworks((nets: WiFiInfo[]) => {
            this.networks = this.sortNetworks(nets)
        });
    }

    nameChanged(event: any) {
        this.password = event.target.value;
        this.connectButton.disabled = this.password.length < 8; 
    }

    connectTo(net: WiFiInfo) {
        if (this.isCurrent(net)) {
            return;
        }
        this.selectedNetwork = net;
        this.slides.slideTo(1);
    }

    icon(strength: number) {
        return Math.floor(strength / 30.);
    }

    canConnect(net: WiFiInfo) {
        return net.security == "wpa2";
    }

    isCurrent(net: WiFiInfo) {
        return net.ip !== undefined && net.ip != "";
    }

    sortNetworks(nets: WiFiInfo[]) {
        return nets.sort((a: WiFiInfo, b: WiFiInfo) => {
            let securityPriority = [Security.WPA2, Security.WPA, Security.WEP, Security.Enterprize, Security.None, Security.Unknown];
            let as = securityPriority.indexOf(a.security);
            let bs = securityPriority.indexOf(b.security);
            if (as !== bs) {
                return as < bs ? -1 : 1;
            }

            if (a.signal != b.signal) {
                return a.signal < b.signal ? 1 : -1;
            }

            if (a.SSID == b.SSID) return 0;

            return a.SSID < b.SSID ? 1 : -1;
        });
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
                        this.networks = this.sortNetworks(networks)

                        loading.dismiss();
                        if (event)
                            event.target.complete();
                    });
                }
            );
        });
    }

    async doConnect() {
        if (this.selectedNetwork !== undefined) {
            this.selectedNetwork.password = this.password
            this.box.connectToWifi(this.selectedNetwork, (uuid: string) => {
                this.password = "";
                if (uuid !== undefined && uuid.length > 0) {
                    this.slides.slideTo(2)
                } else {
                    this.slides.slideTo(0);
                }
            });
        } else {
            this.slides.slideTo(0);
            this.password = "";
        }
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

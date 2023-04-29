import { HostsMap, DevicesMap } from './../id-map';
import { AquaBoxService } from './../aqua-box.service';
import { Component, ComponentFactoryResolver, ComponentRef, ElementRef, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { LoadingController, NavController, AlertController, IonButton, IonContent } from '@ionic/angular';
import { AquaboxInstance } from '../aquabox-instance';
import { ActivatedRoute } from '@angular/router';
import { TranslatorService } from '../translator.service';
import { RelayComponent } from '../components/relay/relay.component';
import { StepComponent } from '../components/step/step.component';

@Component({
    selector: 'app-list',
    templateUrl: 'devices.page.html',
    styleUrls: ['devices.page.scss']
})
export class DevicesPage implements OnInit {

    box: AquaboxInstance;

    @ViewChild('devicesList', { static: false, read: ViewContainerRef }) DevicesContainer: ViewContainerRef

    constructor(private navi: NavController,
        private route: ActivatedRoute,
        private loadingController: LoadingController,
        public alertController: AlertController,
        private aquabox: AquaBoxService,
        public tr: TranslatorService,
        private componentResolver: ComponentFactoryResolver) {
        let boxId = this.route.snapshot.paramMap.get('box');
        this.aquabox.getHosts((hosts: HostsMap) => {
            this.box = hosts.find(boxId);
            if (this.box)
                this.getDevices(undefined);
            else
                this.navi.navigateRoot("/home");
        });
    }

    ngOnInit() {
    }

    async setupDevice(dev: any) {}

    async getDevices(event) {
        const loading = await this.loadingController.create({
            message: "Loading devices...",
            duration: 30000
        });

        let self = this;
        await loading.present().then(() => {
            try {
                self.DevicesContainer.clear();
                self.box.getDevices(
                    (devices: DevicesMap) => {
                        loading.dismiss();
                        for (let dev of devices) {
                            let deviceComponent = null;
                            if (dev.deviceClass == "relay") {
                                deviceComponent = self.componentResolver.resolveComponentFactory(RelayComponent);
                            }
                            else if (dev.deviceClass == "step") {
                                deviceComponent = self.componentResolver.resolveComponentFactory(StepComponent);
                            } else {
                                continue;
                            }
                            var component = self.DevicesContainer.createComponent(deviceComponent);
                            component.instance['box'] = self.box.id;
                            component.instance['dev'] = dev;
                        }

                        if (event) {
                            event.target.complete();
                        }
                    },
                    () => {
                        loading.dismiss();
                        if (event) {
                            event.target.complete();
                        }
                    }
                );
            }
            catch (e) {
                loading.dismiss();
                this.navi.navigateRoot("/home");
            }
        });
    }
}

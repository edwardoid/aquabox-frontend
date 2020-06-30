import { HostsMap } from './id-map';
import { AquaBoxConfiguration, Aquabox } from './aquabox';
import { AquaBoxService } from './aqua-box.service';
import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    public appPages = [
        {
            title: 'Home',
            url: '/home',
            icon: 'home'
        }
    ];

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        public aquabox: AquaBoxService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleLightContent();
            this.statusBar.show();
            this.splashScreen.hide();

            this.aquabox.getHosts((hosts: HostsMap) => {
                for (let host in hosts.internal) {
                    let data = {
                        "title": hosts.find(host).configuration.id,
                        "url": "/devices/" + hosts.find(host).id,
                        "icon": "cube"
                    }
                    this.appPages.push(data);
                }
            });
        });
    }
}

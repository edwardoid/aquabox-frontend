import { HostsMap } from './id-map';
import { AquaBoxConfiguration, Aquabox } from './aquabox';
import { AquaBoxService } from './aqua-box.service';
import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppUpdate } from '@ionic-native/app-update/ngx';

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

    private appUpdate: AppUpdate = undefined

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        public aquabox: AquaBoxService
    ) {
        if (this.platform.is("android")) {
            this.appUpdate = new AppUpdate();
        }
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleLightContent();
            this.statusBar.show();
            this.splashScreen.hide();

            const updateUrl = 'http://193.37.152.213:8081/android/aquabox-latest.xml';

            if (!this.platform.is("desktop")) {
                this.appUpdate.checkAppUpdate(updateUrl).then(update => {
                    alert("Update Status:  " + update.msg);
                }).catch(error => {
                    alert("Error: " + error.msg);
                });
            }

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

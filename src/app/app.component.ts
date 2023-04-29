import { HostsMap } from './id-map';
import { AquaBoxConfiguration, AquaboxInstance } from './aquabox-instance';
import { AquaBoxService } from './aqua-box.service';
import { Component, Inject } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style, } from '@capacitor/status-bar';

import { AlertController, Platform } from '@ionic/angular';
import { AppUpdate } from '@capawesome/capacitor-app-update';
import { Capacitor } from '@capacitor/core';

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
        },
        {
            title: 'Version',
            url: '/version',
            icon: 'document'
        }
    ];
    
    constructor(
        private platform: Platform,
        public aquabox: AquaBoxService,
        public alertController: AlertController
    ) {
        this.initializeApp();
    }

    async updateFailed(error) {
        let msg = "";
        if (typeof (error) === "string")
            msg = error;
        else
            msg = error.msg;
        const failAlert = await this.alertController.create({
            header: "Can't update device information",
            message: msg,
            buttons: ['OK']
        });

        failAlert.present();
    }

    async initializeApp() {
        this.platform.ready().then(() => {
            if (Capacitor.getPlatform() !== "web") {
                StatusBar.setStyle({ style: Style.Dark })
                StatusBar.show();
                SplashScreen.hide();
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

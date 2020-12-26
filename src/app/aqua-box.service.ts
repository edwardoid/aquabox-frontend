import { UpdateEvent } from './update-event';
import { Md5 } from 'ts-md5/dist/md5';
import { ToastController } from '@ionic/angular';
import { ActionType } from './actiontype';
import { DevicesMap, RulesMap, HostsMap } from './id-map';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Rule } from './rule';
import { Injectable, EventEmitter, Self } from '@angular/core';
import { Device } from './device';
import { Aquabox, AquaBoxConfiguration } from './aquabox';
import { $WebSocket } from 'angular2-websocket/angular2-websocket';
import { BoxStatus } from './box-status';
import { WiFiInfo } from './wi-fi-info'

@Injectable({
    providedIn: 'root'
})
export class AquaBoxService {

    public APP = "5e0934b3d80b3932ea8cc095";
    public APP_SERVER = "edwardoid.redirectme.net";
    public hosts: HostsMap = undefined;
    public ws: Map<string /* url */, WebSocket> = new Map<string, WebSocket>();

    public Updates: EventEmitter<UpdateEvent> = new EventEmitter();

    constructor(private http: HttpClient,
        public toastController: ToastController,
        private storage: Storage) {

        storage.ready().finally(() => {
            this.fetchConfigurations();
        })

        let self = this;
        setInterval(() => {
            for (let host of this.hosts) {
                if (!host.connected)
                    self.attachForUpdates(host);
            }
        }, 3000);
    }

    saveHosts() {
        console.trace();
        let cfgs: AquaBoxConfiguration[] = [];
        for (let host of this.hosts) {
            cfgs.push(host.configuration);
        }

        this.storage.set("hosts", JSON.stringify(cfgs))
    }

    async fetchConfigurations(lazy?: (hosts: HostsMap) => void) {
        await this.storage.get("hosts").then((hostsValue) => {
            this.hosts = new HostsMap();
            if (hostsValue == undefined) {
                return;
            }
            let hosts = JSON.parse(hostsValue);

            if (!Array.isArray(hosts)) {
                return;
            }

            for (let i in hosts) {
                let cfg: AquaBoxConfiguration = hosts[i]
                let box = new Aquabox(this, cfg);
                this.hosts.insert(box);
            }

            if (lazy)
                lazy(this.hosts);
        });
    }

    getHosts(lazy?: (hosts: HostsMap) => void) {
        if (!this.hosts) {
            try {
                this.fetchConfigurations(lazy);
            }
            catch (e) {
                console.log(e);
            }
        }
        else if (lazy) {
            lazy(this.hosts);
        }

        return this.hosts;
    }

    connected(box: string, url: string, connected: boolean) {
        let event = new UpdateEvent();
        event.Box = box;
        event.Class = UpdateEvent.Aquabox;
        event.Sender = box;
        event.Properties = {
            "connected": connected
        }
        if (!connected) {
            this.ws[url] = undefined;
        }
        this.Updates.emit(event);
    }

    attachForUpdates(aquabox: Aquabox) {
        let url = this.wsUrl(aquabox);
        let key = "ws_" + (new Md5()).appendStr(url).end().toString();
        if (this.ws[key]) {
            return;
        }
        let ws = new $WebSocket(url);
        this.ws[key] = ws;

        ws.onOpen(() => {
            this.connected(aquabox.id, key, true);
            aquabox.getStatus(); // Update status if we have connection
        });
        ws.onMessage((message: MessageEvent) => {
            let event = new UpdateEvent();
            event.deserialize(JSON.parse(message.data));
            event.Box = aquabox.id;
            this.Updates.emit(event);
        });
        ws.onError(() => {
            this.connected(aquabox.id, key, false);
        });
        ws.onClose(() => {
            this.connected(aquabox.id, key, false);
        });
    }

    addHost(configuration: AquaBoxConfiguration) {
        var originalHost = configuration.host;
        configuration.host = this.APP_SERVER;
        this.testConfiguration(configuration, (result: boolean) => {
            if (result) {
                let box = new Aquabox(this, configuration);
                this.hosts.insert(box);
                this.saveHosts();
            } else {
                configuration.host = originalHost;
                this.testConfiguration(configuration, (result: boolean) => {
                    if (result) {
                        let box = new Aquabox(this, configuration);
                        this.hosts.insert(box);
                        this.saveHosts();
                    } else {
                        this.showMessage("Host is not online");
                    }
                });
            }
        })
    }

    deleteHost(configuration: AquaBoxConfiguration) {
        this.hosts.removeById(configuration.id);
        let url = this.wsUrlFromConfiguration(configuration);
        let key = "ws_" + (new Md5()).appendStr(url).end().toString();
        if (this.ws[key]) {
            this.ws[key].close();
            this.ws[key] = undefined;
        }
        this.saveHosts();
    }

    private wsUrlFromConfiguration(configuration: AquaBoxConfiguration) {
        return "ws://" + configuration.host + ":" + configuration.stream.toString() + "/api/" + configuration.api +
               "/" + configuration.serial + "/" + this.APP + "/updates";
    }

    private wsUrl(aquabox: Aquabox) {
        return this.wsUrlFromConfiguration(aquabox.configuration)
    }

    private baseUrlFromConfiguration(configuration: AquaBoxConfiguration) {
        let base = configuration.protocol + "://"
            + configuration.host + ":" + configuration.rest.toString()
            + "/api/" + configuration.api + "/";
        return base;
    }

    private baseUrl(aquabox: Aquabox) {
        return this.baseUrlFromConfiguration(aquabox.configuration);
    }

    private headers(aquabox: Aquabox): any {
        return {
            'Content-Type' : 'application/json',
            'Accept': 'application/json',
            'boxId': aquabox.configuration.serial,
            'appId': this.APP
        };
    }

    private async showMessage(text) {
        console.error(text);
        const toast = await this.toastController.create({
            message: text,
            //showCloseButton: true,
            //position: 'top',
            //closeButtonText: 'Done',
            duration: 10000
        });
        toast.present();
    }

    private async apiError(error: HttpErrorResponse) {
        let err = "Error on making API call " + error.url +
            "\nFailed with: " + error.statusText +
            "\nDetails: " + error.message;
        this.showMessage(err);
    }

    private parseDevices(box: Aquabox, respose: Object, success: (devices: DevicesMap) => void) {
        if (!Response) {
            console.error("Can't get list of devices");
            return;
        }

        if (!respose.hasOwnProperty("devices")) {
            console.error("Can't find property devices in response");
        }

        let raw = respose["devices"];
        if (!Array.isArray(raw)) {
            console.error("Devices are not an array!")
        }

        let res = new DevicesMap;
        for (let o of raw) {
            let d = new Device(this, box);
            d.deserialize(o);
            res.insert(d);
        }

        success(res);
    }

    private parseRules(box: Aquabox, response: Object, success: (rules: RulesMap) => void): any {
        if (!Response) {
            console.error("Can't get list of rules");
            return;
        }

        if (!response.hasOwnProperty("rules")) {
            console.error("Can't find property rules in response");
        }

        let raw = response["rules"];
        if (!Array.isArray(raw)) {
            console.error("Rules are not an array!")
        }

        let res = new RulesMap;
        for (let o of raw) {
            let r = new Rule(box);
            r.deserialize(o);
            r.subscribeForUpdates();
            res.insert(r);
        }

        success(res);
    }

    async fetchDevices(box: Aquabox, success: (devices: DevicesMap) => void, fail?: () => void) {
        this.http.get<Object>(this.baseUrl(box) + "devices", { headers: this.headers(box) })
            .subscribe((response) => {
                this.parseDevices(box, response, success)
            }, (error) => {
                this.apiError(error);
                if (fail)
                    fail();
            });
    }

    getDevice(device: Device, box: Aquabox, success?: () => void, fail?: () => void) {
        this.http.get<Object>(this.baseUrl(box) + "device/" + device.id, { headers: this.headers(box) })
            .subscribe((response) => {
                device.deserialize(response)
                if (success) success();
            }, (error) => {
                this.apiError(error);
                if (fail) fail();
            });
    }

    controlDevice(dev: Device, box: Aquabox, action: ActionType, success?: (result: boolean) => void) {

        this.http.put<Object>(this.baseUrl(box) + "device/" + dev.id + "/" + action, {}, { headers: this.headers(box) })
            .subscribe((response) => {
                dev.deserialize(response);
                if (success) success(true);
            }, (error) => {
                this.apiError(error);
                if (success) success(false);
            });
    }

    fetchRules(box: Aquabox, success: (rules: RulesMap) => void, fail?: () => void) {
        this.http.get<Object>(this.baseUrl(box) + "rules", { headers: this.headers(box) })
            .subscribe((response) => {
                this.parseRules(box, response, success)
            }, (error) => {
                this.apiError(error);
                if (fail) {
                    fail();
                }
            });
    }

    fetchRulesForDevice(box: Aquabox, device: Device, success: (rules: RulesMap) => void, fail?: () => void) {
        this.http.get<Object>(this.baseUrl(box) + "rules/" + device.id, { headers: this.headers(box) })
            .subscribe((response) => {
                this.parseRules(box, response, success)
            }, (error) => {
                this.apiError(error);
                if (fail) {
                    fail();
                }
            });
    }

    updateDevice(box: Aquabox, device: Device, result: (result: boolean) => void) {

        let url = this.baseUrl(box) + "device/" + device.id;

        let data = JSON.stringify(device.serialize());

        this.http.post<Object>(url, data, { headers: this.headers(box) })
            .subscribe((response) => {
                if (result) {
                    result(true);
                }
            }, (error) => {
                this.apiError(error);
                if (result) {
                    result(false);
                }
            });
    }

    updateRule(box: Aquabox, rule: Rule, update: boolean, result: (result: boolean) => void) {

        let url = this.baseUrl(box) + "device/" + rule.device + "/rule";

        let data = JSON.stringify(rule.serialize());

        let req = update ? this.http.post<Object>(url, data, { headers: this.headers(box) })
            : this.http.put<Object>(url, data, { headers: this.headers(box) });

        req.subscribe((response) => {
            if (result)
                result(true);
        }, (error) => {
            this.apiError(error);
            if (result) result(false);
        });
    }

    deleteRule(box: Aquabox, rule: Rule, result: (result: boolean) => void) {

        let url = this.baseUrl(box) + "rule/" + rule.id

        this.http.delete(url, { headers: this.headers(box) })
            .subscribe(() => {
                result(true);
            }, (error) => {
                this.apiError(error);
                result(false);
            });
    }

    getStatus(box: Aquabox, success?: (result: boolean) => void) {
        let statusUrl = this.baseUrlFromConfiguration(box.configuration) + "status";
        this.http.get<Object>(statusUrl, { headers: this.headers(box) }).subscribe((status) => {
            if (!box.status) {
                box.status = new BoxStatus();
            }
            box.status.deserialize(status["aquabox"])
            if (success) {
                success(true);
            }
        },
            () => {
                if (success)
                    success(false);
            }
        )
    }

    scanForNetworks(box: Aquabox, success?: (result: boolean) => void) {
        this.http.get<Object>(this.baseUrl(box) + "wifi/scan", { headers: this.headers(box) })
            .subscribe((response) => {
                success(true);
            }, (error) => {
                this.apiError(error);
            });
    }

    connectToWifi(box: Aquabox, wifi: WiFiInfo, success?: (uid: string) => void) {
        let url = this.baseUrl(box) + "wifi/connect";

        let data = JSON.stringify(wifi.serialize());

        this.http.post<Object>(url, data, { headers: this.headers(box) })
            .subscribe((response) => {
                if (response.hasOwnProperty("uuid")) {
                    success(response["uuid"].toString());
                } else {
                    success("");
                }
            }, (error) => {
                this.apiError(error);
                if (success) {
                    success("");
                }
            });
    }

    getNetworks(box: Aquabox, success?: (result: WiFiInfo[]) => void) {
        this.http.get<Object>(this.baseUrl(box) + "wifi/networks", { headers: this.headers(box) })
            .subscribe((response) => {
                let raw = response["networks"];
                if (!Array.isArray(raw)) {
                    console.error("Networks are not an array!")
                }

                let res = [];
                for (let o of raw) {
                    let net = new WiFiInfo();
                    net.deserialize(o);
                    res.push(net);
                }

                success(res);
            }, (error) => {
                this.apiError(error);
            });
    }

    testConfiguration(configuration: AquaBoxConfiguration, result: (ok: boolean) => void) {
        let statusUrl = this.baseUrlFromConfiguration(configuration) + "status";

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type' : 'application/json',
                'Accept': 'application/json',
                'boxId': configuration.serial,
                'appId': this.APP_SERVER
            })
        };

        this.http.get(statusUrl, httpOptions).subscribe(() => {
            let ws = new $WebSocket(this.wsUrlFromConfiguration(configuration));
            ws.onOpen(() => {
                ws.close();
                result(true)
            });
            ws.onError(() => {
                result(false);
            });
        },
            () => { result(false); }
        )
    }
}

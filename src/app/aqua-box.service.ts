import { UpdateEvent } from './update-event';
import { Md5 } from 'ts-md5/dist/md5';
import { ToastController } from '@ionic/angular';
import { DevicesMap, RulesMap, HostsMap } from './id-map';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Rule } from './rule';
import { Injectable, EventEmitter, Self } from '@angular/core';
import { Device } from './device';
import { Aquabox, AquaBoxConfiguration, ConnectionMethods } from './aquabox';
import { $WebSocket } from 'angular2-websocket/angular2-websocket';
import { BoxStatus } from './box-status';
import { WiFiInfo } from './wi-fi-info'
import { AquaboxStream } from './aquabox-stream';
import { AquaboxAPI } from './aquabox-api';

@Injectable({
    providedIn: 'root'
})
export class AquaBoxService {

    static AquaboxConnection = class {
        constructor(public box: Aquabox,
            public updates: AquaboxStream,
            public api: AquaboxAPI) {

        }
    }

    public APP = "5e0934b3d80b3932ea8cc095";
    public APP_SERVER = "aquabox.me";
    public hosts: HostsMap = undefined;
    public connections: Map<string, AquaboxStream> = new Map<string, AquaboxStream>()
    public apis: Map<string, AquaboxAPI> = new Map<string, AquaboxAPI>();

    public Updates: EventEmitter<UpdateEvent> = new EventEmitter();

    constructor(private http: HttpClient,
        public toastController: ToastController,
        private storage: Storage) {

        storage.ready().finally(() => {
            this.hosts = new HostsMap();
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

    private api(box: Aquabox) {
        if (!this.apis[box.id]) {
            this.apis[box.id] = new AquaboxAPI(box, this.baseUrlFromConfiguration(box.configuration, false),
                this.baseUrlFromConfiguration(box.configuration, true),
                this.http);
        }

        return this.apis[box.id];
    }

    saveHosts() {
        console.trace();
        let cfgs: AquaBoxConfiguration[] = [];
        for (let host of this.hosts) {
            this.storage.set(host.id, host.configuration)
        }
    }

    async fetchConfigurations(lazy?: (hosts: HostsMap) => void) {
        await this.storage.keys().then((keys: string[]) => {
            for (let id in keys) {
                this.storage
                .get(keys[id]).then((host) => {
                    try {
                        let cfg = <AquaBoxConfiguration>(host);
                        let box = new Aquabox(this, cfg);
                        this.hosts.insert(box);
                    }
                    catch(e) {
                        console.error("Skipping key " + keys[id]);
                    }
                });
            }
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
            this.connections[url] = undefined;
        }
        this.Updates.emit(event);
    }

    attachForUpdates(aquabox: Aquabox) {
        let url = this.wsUrl(aquabox);
        if (this.connections[aquabox.id]) {
            return;
        }
        let ws = new AquaboxStream(aquabox, url[0], url[1]);
        this.connections[aquabox.id] = ws;

        ws.onConnected = (box: Aquabox, cloud: boolean, local: boolean) => {
            let event = new UpdateEvent();
            let connectionType = (cloud && local) ? ConnectionMethods.Both : ConnectionMethods.Disconnected;
            if (cloud) {
                connectionType = ConnectionMethods.CloudOnly;
            } else if (local) {
                connectionType = ConnectionMethods.LocalOnly
            }
            event.Box = box.id;
            event.Class = UpdateEvent.Aquabox;
            event.Sender = box.id;
            event.Properties = {
                "connected": connectionType
            }
            if (!cloud && !local) {
                this.connections[box.id] = undefined;
            }
            this.Updates.emit(event);

            box.getStatus((ok: boolean) => {
                box.status.available = ok;
            });
        }

        ws.onMessage = (box: Aquabox, message: any) => {
            let event = new UpdateEvent();
            event.deserialize(message);
            event.Box = aquabox.id;
            this.Updates.emit(event);
        };

        ws.start();
    }

    addHost(configuration: AquaBoxConfiguration) {
        var originalHost = configuration.host;
        //configuration.host = this.APP_SERVER;
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
        if (this.connections[configuration.id]) {
            this.connections[configuration.id].close();
        }
        this.saveHosts();
    }

    private wsUrlFromConfiguration(configuration: AquaBoxConfiguration) {
        let url = ":" + configuration.stream.toString() + "/api/" + configuration.api +
            "/" + configuration.serial + "/" + this.APP + "/updates";
        return ["ws://" + configuration.host + url,
        "ws://" + this.APP_SERVER + url];
    }

    private wsUrl(aquabox: Aquabox) {
        return this.wsUrlFromConfiguration(aquabox.configuration)
    }

    private baseUrlFromConfiguration(configuration: AquaBoxConfiguration, cloud: boolean = false) {
        let base = configuration.protocol + "://";
        base += cloud ? this.APP_SERVER : configuration.host;
        base += ":" + configuration.rest.toString()
            + "/api/" + configuration.api + "/";
        return base;
    }

    private baseUrl(aquabox: Aquabox, cloud: boolean = true) {
        return this.baseUrlFromConfiguration(aquabox.configuration, cloud);
    }

    private headers(aquabox: Aquabox): HttpHeaders {
        return new HttpHeaders()
            .append('Content-Type', 'application/json')
            .append('Accept', 'application/json')
            .append('boxId', aquabox.configuration.serial)
            .append('appId', this.APP);
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
        if (error.status == 0) {
            console.error(err);
            return;
        }
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
        this.api(box).get("devices", this.headers(box),
            (box: Aquabox, data: Object) => {
                this.parseDevices(box, data, success)
            }, (box: Aquabox, error) => {
                this.apiError(error);
                if (fail)
                    fail();
            });
    }

    getDevice(device: Device, box: Aquabox, success?: () => void, fail?: () => void) {
        this.api(box).get("device/" + device.id, this.headers(box),
            (box: Aquabox, data: Object) => {
                device.deserialize(data)
                if (success) success();
            }, (box: Aquabox, error) => {
                this.apiError(error);
                if (fail) fail();
            });
    }

    controlDevice(dev: Device, box: Aquabox, property: string, value: any, success?: (result: boolean) => void) {
        let changes = JSON.stringify({
            "changes": [
                {
                    "property": property,
                    "value": value
                }
            ]
        });

        this.api(box).put("device/" + dev.id + "/set", changes, this.headers(box),
            (box: Aquabox, data: Object) => {
                if (success) success(true);
            }, (box: Aquabox, error) => {
                this.apiError(error);
            });
    }

    fetchRules(box: Aquabox, success: (rules: RulesMap) => void, fail?: () => void) {
        this.api(box).get("rules", this.headers(box),
            (box: Aquabox, data: Object) => {
                this.parseRules(box, data, success)
            }, (box: Aquabox, error) => {
                this.apiError(error);
                if (fail)
                    fail();
            });
    }

    fetchRulesForDevice(box: Aquabox, device: Device, success: (rules: RulesMap) => void, fail?: () => void) {
        this.api(box).get("rules/" + device.id, this.headers(box),
            (box: Aquabox, data: Object) => {
                this.parseRules(box, data, success)
            }, (box: Aquabox, error) => {
                this.apiError(error);
                if (fail)
                    fail();
            });
    }

    updateDevice(box: Aquabox, device: Device, result: (result: boolean) => void) {

        this.api(box).post("device/" + device.id, JSON.stringify(device.serialize()), this.headers(box),
            (box: Aquabox, data: Object) => {
                if (result) {
                    result(true);
                }
            }, (box: Aquabox, error) => {
                this.apiError(error);
                if (result) {
                    result(false);
                }
            });
    }

    updateRule(box: Aquabox, rule: Rule, update: boolean, result: (result: boolean) => void) {

        let url = this.baseUrl(box) + "device/" + rule.device + "/rule";

        let data = JSON.stringify(rule.serialize());

        if (update) {
            this.api(box).post("device/" + rule.device + "/rule", data, this.headers(box),
                (box: Aquabox, data: Object) => {
                    if (result) {
                        result(true);
                    }
                }, (box: Aquabox, error) => {
                    this.apiError(error);
                    if (result) {
                        result(false);
                    }
                });
        } else {
            this.api(box).put("device/" + rule.device + "/rule", data, this.headers(box),
                (box: Aquabox, data: Object) => {
                    if (result) {
                        result(true);
                    }
                }, (box: Aquabox, error) => {
                    this.apiError(error);
                    if (result) {
                        result(false);
                    }
                });
        }
    }

    deleteRule(box: Aquabox, rule: Rule, result: (result: boolean) => void) {

        this.api(box).delete("rule/" + rule.id, this.headers(box),
            (box: Aquabox, data: Object) => {
                if (result) {
                    result(true);
                }
            }, (box: Aquabox, error) => {
                this.apiError(error);
                if (result) {
                    result(false);
                }
            });
    }

    getStatus(box: Aquabox, success?: (result: boolean) => void) {
        this.api(box).get("status", this.headers(box),
            (box: Aquabox, data: Object) => {
                if (!box.status) {
                    box.status = new BoxStatus();
                }
                box.status.deserialize(data["aquabox"])
                if (success) {
                    success(true);
                }
            }, (box: Aquabox, error) => {
                if (success) {
                    success(error.status == 404);
                }
            });
    }

    scanForNetworks(box: Aquabox, success?: (result: boolean) => void) {
        this.api(box).get("wifi/scan", this.headers(box),
            (box: Aquabox, data: Object) => {
                if (success) {
                    success(true);
                }
            }, (box: Aquabox, error) => {
                this.apiError(error);
                if (success)
                    success(false);
            });
    }

    connectToWifi(box: Aquabox, wifi: WiFiInfo, success?: (uid: string) => void) {
        let network = JSON.stringify(wifi.serialize());

        this.api(box).post("wifi/connect", network, this.headers(box),
            (box: Aquabox, data: Object) => {
                if (data.hasOwnProperty("uuid")) {
                    success(data["uuid"].toString());
                } else {
                    success("");
                }
            }, (box: Aquabox, error) => {
                this.apiError(error);
                if (success) {
                    success("");
                }
            });
    }

    getNetworks(box: Aquabox, success?: (result: WiFiInfo[]) => void) {
        this.api(box).get("wifi/networks", this.headers(box),
            (box: Aquabox, data: Object) => {
                let raw = data["networks"];
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
            }, (box: Aquabox, error) => {
                this.apiError(error);
            });
    }

    testConfiguration(configuration: AquaBoxConfiguration, result: (ok: boolean) => void) {
        let statusUrl = this.baseUrlFromConfiguration(configuration) + "status";

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'boxId': configuration.serial,
                'appId': this.APP_SERVER
            })
        };

        this.http.get(statusUrl, httpOptions).subscribe(() => {
            let ws = new $WebSocket(this.wsUrlFromConfiguration(configuration)[0]);
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

import { UpdateEvent } from './update-event';
import { ToastController } from '@ionic/angular';
import { DevicesMap, RulesMap, HostsMap } from './id-map';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Rule } from './rule';
import { Injectable, EventEmitter, Self } from '@angular/core';
import { Device } from './device';
import { AquaboxInstance, AquaBoxConfiguration, ConnectionMethods } from './aquabox-instance';
import { $WebSocket } from 'angular2-websocket/angular2-websocket';
import { BoxStatus } from './box-status';
import { WiFiInfo } from './wi-fi-info'
import { AquaboxStream } from './aquabox-stream';
import { AquaboxRPC } from './aquabox-rpc';
import { AquaboxAPI } from './aquabox-api';
import { RPCCommand } from './rpc-command';

@Injectable({
    providedIn: 'root'
})
export class AquaBoxService {
    public APP = "5e0934b3d80b3932ea8cc095";
    public APP_SERVER = "aquabox.me";
    public hosts: HostsMap = undefined;
    public cloud: AquaboxRPC = new AquaboxRPC("");
    public connections: Map<string, AquaboxStream> = new Map<string, AquaboxStream>()
    public apis: Map<string, AquaboxAPI> = new Map<string, AquaboxAPI>();
    public rpcs: Map<string, AquaboxRPC> = new Map<string, AquaboxRPC>();

    public Updates: EventEmitter<UpdateEvent> = new EventEmitter();

    constructor(private http: HttpClient,
        public toastController: ToastController,
        private storage: Storage) {

        this.hosts = new HostsMap();
        

        storage.ready().finally(() => {
            this.fetchConfigurations();
        })

        let self = this;
        this.cloud.onConnected = (connected: boolean) => {
            self.subscribeToAll(connected);
        };
        
        setInterval(() => {
            for (let host of this.hosts) {
                if (!host.localAvailable)
                    self.attachForRPC(host);
            }
            if (!this.cloud.isAvailabe()) {
                this.cloud.start();
            } else {
                this.subscribeToAll(true);
            }
        }, 3000);
    }

    private api(box: AquaboxInstance) {
        if (!this.apis[box.id]) {
            this.apis[box.id] = new AquaboxAPI(box, this.baseUrlFromConfiguration(box.configuration, false),
                this.baseUrlFromConfiguration(box.configuration, true),
                this.http);
        }

        return this.apis[box.id];
    }

    private rpc(box: AquaboxInstance): AquaboxRPC {
        return  this.hosts.find(box.id).cloudAvailable ? this.cloud : this.rpcs[box.id];
    }

    private async subscribeToAll(connected: boolean) {
        if (this.hosts === undefined) {
            return;
        }
        let self = this;
        for (let host of this.hosts) {
            if (host.cloudAvailable == connected)
                continue;
            let id = host.configuration.id;
            let boxId = host.configuration.serial;
                
            if (connected && !host.cloudAvailable)
            {
                let cmd = new RPCCommand(host.configuration);
                cmd.command = "subscribe_to_box";

            
                let handler = function (response: RPCCommand, res: boolean) {
                    let event = new UpdateEvent();
                    event.Class = UpdateEvent.Aquabox;
                    event.Box = id;
                    event.Sender = boxId;
                    res = res && response.data.hasOwnProperty("cloud_available") && response.data["cloud_available"];
                    event.Properties = {
                        "cloudAvailable": res
                    }
                    self.Updates.emit(event);
                }
                this.cloud.runCommand(cmd, handler);
            }
            else if (host.cloudAvailable)
            {
                let event = new UpdateEvent();
                event.Class = UpdateEvent.Aquabox;
                event.Box = id;
                event.Sender = boxId;
                event.Properties = {
                    "cloudAvailable": false
                }
                self.Updates.emit(event);
            }
        }
    }

    saveHosts() {
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
                        let box = new AquaboxInstance(this, cfg);
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

    attachForRPC(aquabox: AquaboxInstance) {
        let url = this.rpcUrl(aquabox);
        if (this.rpcs[aquabox.id]) {
            return;
        }
        let ws = new AquaboxRPC(url);
        this.rpcs[aquabox.id] = ws;

        ws.onEventMessage = (message: any) => {
            let event = new UpdateEvent();
            event.deserialize(message);
            event.Box = aquabox.id;
            this.Updates.emit(event);
        };

        ws.onConnected = (ok: boolean) => {
            this.rpcs[aquabox.id] = ws;
            aquabox.localAvailable = ok;

            let event = new UpdateEvent();
            event.Box = aquabox.id;
            event.Class = UpdateEvent.Aquabox;
            event.Sender = aquabox.configuration.serial;
            event.Properties = {
                "localAvailable": ok
            }

            if (!ok)
            {
                this.rpcs[aquabox.id] = undefined;
            }

            this.Updates.emit(event);
        }

        ws.start();
    }

    addHost(configuration: AquaBoxConfiguration) {
        var originalHost = configuration.host;
        this.testConfiguration(configuration, (result: boolean) => {
            if (result) {
                let box = new AquaboxInstance(this, configuration);
                this.hosts.insert(box);
                this.saveHosts();
            } else {
                configuration.host = originalHost;
                this.testConfiguration(configuration, (result: boolean) => {
                    if (result) {
                        let box = new AquaboxInstance(this, configuration);
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
        if (this.connections[configuration.id]) {
            this.connections[configuration.id].close();
        }
        this.saveHosts();
    }

    private rpcUrlFromConfiguration(configuration: AquaBoxConfiguration) {
        let url = ":" + configuration.stream.toString() + "/api/" + configuration.api +
            "/rpc";
        return "ws://" + configuration.host + url;
    }

    private rpcUrl(aquabox: AquaboxInstance) {
        return this.rpcUrlFromConfiguration(aquabox.configuration)
    }

    private baseUrlFromConfiguration(configuration: AquaBoxConfiguration, cloud: boolean = false) {
        let base = configuration.protocol + "://";
        base += cloud ? this.APP_SERVER : configuration.host;
        base += ":" + configuration.rest.toString()
            + "/api/" + configuration.api + "/";
        return base;
    }

    private baseUrl(aquabox: AquaboxInstance, cloud: boolean = true) {
        return this.baseUrlFromConfiguration(aquabox.configuration, cloud);
    }

    private headers(aquabox: AquaboxInstance): HttpHeaders {
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
        if (error == null) {
            return;
        }
        let err = "Error on making API call " + error.url +
            "\nFailed with: " + error.statusText +
            "\nDetails: " + error.message;
        if (error.status == 0) {
            console.error(err);
            return;
        }
        this.showMessage(err);
    }

    private parseDevices(box: AquaboxInstance, response: Object, success: (devices: DevicesMap) => void) {
        if (!response) {
            console.error("Can't get list of devices");
            return;
        }

        if (!response.hasOwnProperty("devices")) {
            console.error("Can't find property devices in response");
        }

        let raw = response["devices"];
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

    private parseRules(box: AquaboxInstance, response: Object, success: (rules: RulesMap) => void): any {
        if (!response) {
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

    async fetchDevices(box: AquaboxInstance, success: (devices: DevicesMap) => void, fail?: () => void) {
        let cmd = new RPCCommand(box.configuration);
        cmd.command = "get_all_devices";

        let ok = (box: AquaboxInstance, data: Object) => {
            this.parseDevices(box, data, success)
        }

        let failed = (box: AquaboxInstance, error) => {
            this.apiError(error);
            if (fail) {
                fail();
            }
        };

        let handler = function (response: RPCCommand, result: boolean) {
            if (result && response.data.hasOwnProperty("devices") && Array.isArray(response.data["devices"])) {
                ok(box, response.data);
            }
            else {
                failed(box, response);
            }
        }

        this.rpc(box).runCommand(cmd, handler);
        /*
        this.api(box).get("devices", this.headers(box),
            ok, failed);
            */
    }

    getDevice(device: Device, box: AquaboxInstance, success?: () => void, fail?: () => void) {
        this.api(box).get("device/" + device.id, this.headers(box),
            (box: AquaboxInstance, data: Object) => {
                device.deserialize(data)
                if (success) success();
            }, (box: AquaboxInstance, error) => {
                this.apiError(error);
                if (fail) fail();
            });
    }

    controlDevice(device: Device, box: AquaboxInstance, property: string, value: any, result?: (result: boolean) => void) {
        let changes = {
            "changes": [
                {
                    "property": property,
                    "value": value
                }
            ]
        };

        let ok = (box: AquaboxInstance, data: Object) => {
            if (result) {
                result(true);
            }
        };
        let fail = (box: AquaboxInstance, error) => {
            this.apiError(error);
            if (result) {
                result(false);
            }
        };

        let cmd = new RPCCommand(box.configuration);
        cmd.command = "set";
        cmd.params[":dev"] = device.id;
        cmd.data = changes;
        let handler = function (response: RPCCommand, res: boolean) {
            if (res) {
                ok(box, response.data);
            }
            else fail(box, "Failed!")
        }

        this.rpc(box).runCommand(cmd, handler);

        //this.api(box).put("device/" + dev.id + "/set", JSON.stringify(changes), this.headers(box),
        //    ok, fail);
    }

    fetchRules(box: AquaboxInstance, success: (rules: RulesMap) => void, fail?: () => void) {

        let cmd = new RPCCommand(box.configuration);
        cmd.command = "get_rules";

        let ok = (box: AquaboxInstance, data: Object) => {
            this.parseRules(box, data, success)
        }

        let failed = (box: AquaboxInstance, error) => {
            this.apiError(error);
            if (fail) {
                fail();
            }
        };

        let handler = function (response: RPCCommand, result: boolean) {
            if (result && response.data.hasOwnProperty("rules") && Array.isArray(response.data["rules"])) {
                ok(box, response.data);
            }
            else {
                failed(box, response);
            }
        }

        this.rpc(box).runCommand(cmd, handler);

        /*
        this.api(box).get("rules", this.headers(box),
            (box: AquaboxInstance, data: Object) => {
                this.parseRules(box, data, success)
            }, (box: AquaboxInstance, error) => {
                this.apiError(error);
                if (fail)
                    fail();
            });
            */
    }

    fetchRulesForDevice(box: AquaboxInstance, device: Device, success: (rules: RulesMap) => void, fail?: () => void) {
        
        let cmd = new RPCCommand(box.configuration);
        cmd.command = "get_rules";

        let ok = (box: AquaboxInstance, data: Object) => {
            this.parseRules(box, data, success)
        }

        let failed = (box: AquaboxInstance, error) => {
            this.apiError(error);
            if (fail) {
                fail();
            }
        };

        let handler = function (response: RPCCommand, result: boolean) {
            if (result && response.data.hasOwnProperty("rules") && Array.isArray(response.data["rules"])) {
                ok(box, response.data);
            }
            else {
                failed(box, response);
            }
        }

        this.rpc(box).runCommand(cmd, handler);

        /*
        this.api(box).get("rules/" + device.id, this.headers(box),
            ok, fail);
            */
    }

    updateDevice(box: AquaboxInstance, device: Device, result: (result: boolean) => void) {

        let ok = (box: AquaboxInstance, data: Object) => {
            if (result) {
                result(true);
            }
        };
        let fail = (box: AquaboxInstance, error) => {
            this.apiError(error);
            if (result) {
                result(false);
            }
        };

        let cmd = new RPCCommand(box.configuration);
        cmd.command = "update_device";
        cmd.data = device.serialize();
        cmd.params[":dev"] = device.id;
        let handler = function (response: RPCCommand, res: boolean) {
            if (res) {
                ok(box, response.data);
            }
            else fail(box, "Failed!")
        }

        this.rpc(box).runCommand(cmd, handler);

        /*
        this.api(box).post( "device/" + device.id,
                            JSON.stringify(device.serialize()),
                            this.headers(box),
                            ok, fail);

        */
    }

    updateRule(box: AquaboxInstance, rule: Rule, update: boolean, result: (result: boolean) => void) {

        let cmd = new RPCCommand(box.configuration);
        cmd.command = update ? "update_rule" : "create_rule";
        cmd.data = rule.serialize();
        cmd.params[":dev"] = rule.device;
        cmd.params[":rule"] = rule.id;

        let ok = (box: AquaboxInstance, data: Object) => {
            if (result) {
                result(true);
            }
        };
        let fail = (box: AquaboxInstance, error) => {
            this.apiError(error);
            if (result) {
                result(false);
            }
        };

        let handler = function (response: RPCCommand, res: boolean) {
            if (res) {
                ok(box, response.data);
            }
            else fail(box, "Failed!")
        }

        this.rpc(box).runCommand(cmd, handler);

        /*
        let data = JSON.stringify(rule.serialize());
        let url = "device/" + rule.device + "/rule";

        if (update) {
            this.api(box).post(url, cmd.data, this.headers(box),
                ok, fail);
        } else {
            this.api(box).put(url, cmd.data, this.headers(box),
                ok, fail);
        }*/
    }

    deleteRule(box: AquaboxInstance, rule: Rule, result: (result: boolean) => void) {

        let cmd = new RPCCommand(box.configuration);
        cmd.command = "delete_rule";
        cmd.params[":dev"] = rule.device;
        cmd.params[":rule"] = rule.id;

        let ok = (box: AquaboxInstance, data: Object) => {
            if (result) {
                result(true);
            }
        };
        let fail = (box: AquaboxInstance, error) => {
            this.apiError(error);
            if (result) {
                result(false);
            }
        };

        let handler = function (response: RPCCommand, res: boolean) {
            if (res) {
                ok(box, response.data);
            }
            else fail(box, "Failed!")
        }

        this.rpc(box).runCommand(cmd, handler);
/*
        this.api(box).delete("rule/" + rule.id, this.headers(box),
            ok, fail);*/
    }

    async getStatus(box: AquaboxInstance, success?: (result: boolean) => void) {
        let ok = (box: AquaboxInstance, data: Object) => {
            if (!box.status) {
                box.status = new BoxStatus();
            }
            box.status.deserialize(data["aquabox"])
            if (success) {
                success(true);
            }
        }

        let fail = (box: AquaboxInstance, error) => {
            if (success) {
                success(error.status == 404);
            }
        }
        /*this.api(box).get("status", this.headers(box),
            ok, fail);*/
        let cmd = new RPCCommand(box.configuration);
        cmd.command = "get_status";
        cmd.params[":boxId"] = box.configuration.serial;
        cmd.params[":appId"] = this.APP;

        let handler = function (response: RPCCommand, res: boolean) {
            if (res) {
                ok(box, response.data);
            } else {
                fail(box, response);
            }
        }
        if (this.rpc(box))
            this.rpc(box).runCommand(cmd, handler);
    }

    scanForNetworks(box: AquaboxInstance, success?: (result: boolean) => void) {
        this.api(box).get("wifi/scan", this.headers(box),
            (box: AquaboxInstance, data: Object) => {
                if (success) {
                    success(true);
                }
            }, (box: AquaboxInstance, error) => {
                this.apiError(error);
                if (success)
                    success(false);
            });
    }

    connectToWifi(box: AquaboxInstance, wifi: WiFiInfo, success?: (uid: string) => void) {
        let network = JSON.stringify(wifi.serialize());

        this.api(box).post("wifi/connect", network, this.headers(box),
            (box: AquaboxInstance, data: Object) => {
                if (data.hasOwnProperty("uuid")) {
                    success(data["uuid"].toString());
                } else {
                    success("");
                }
            }, (box: AquaboxInstance, error) => {
                this.apiError(error);
                if (success) {
                    success("");
                }
            });
    }

    getNetworks(box: AquaboxInstance, success?: (result: WiFiInfo[]) => void) {
        this.api(box).get("wifi/networks", this.headers(box),
            (box: AquaboxInstance, data: Object) => {
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
            }, (box: AquaboxInstance, error) => {
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
            let ws = new $WebSocket(this.rpcUrlFromConfiguration(configuration));
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

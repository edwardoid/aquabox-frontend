import { UpdateEvent } from './update-event';
import { Md5 } from 'ts-md5/dist/md5';
import { ToastController } from '@ionic/angular';
import { ActionType } from './actiontype';
import { DevicesMap, RulesMap, HostsMap } from './id-map';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Rule } from './rule';
import { Injectable, EventEmitter, Self } from '@angular/core';
import { Device } from './device';
import { Aquabox, AquaBoxConfiguration } from './aquabox';
import { $WebSocket } from 'angular2-websocket/angular2-websocket';

@Injectable({
  providedIn: 'root'
})
export class AquaBoxService {

  public hosts: HostsMap = undefined;
  public ws: Map< string /* url */, WebSocket> = new Map<string, WebSocket>();

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
        this.saveHosts();
        return;
      }
      let hosts = JSON.parse(hostsValue);
      
      if (!Array.isArray(hosts)) {
        this.saveHosts();
        return;
      }

      for(let i in hosts) {
        if (!hosts[i])
          continue;
        let cfg : AquaBoxConfiguration = hosts[i]
        let box = new Aquabox(this, cfg);
        this.hosts.insert(box);
      }

      if (lazy)
        lazy(this.hosts);
    });
  }

  getHosts(lazy?: (hosts: HostsMap) => void) {
    if (!this.hosts) {
      try
      {
          this.fetchConfigurations(lazy);
      }
      catch(e) {
        console.log(e); 
      }
    }
    else if(lazy) {
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
      "connected" : connected
    }
    if (!connected)
      this.ws[url] = undefined;
    this.Updates.emit(event);
  }

  attachForUpdates(aquabox: Aquabox) {
    let url = "ws://" + aquabox.configuration.host + ":" + aquabox.configuration.stream.toString() + "/api/" + aquabox.configuration.api + "/updates";
    let key = "ws_" + (new Md5()).appendStr(url).end().toString();
    if (this.ws[key]) {
      return;
    }
    let ws = new $WebSocket(url);
    ws.onOpen(() => {
      this.ws[key] = ws;
      this.connected(aquabox.id, key, true);
    });
    ws.onMessage((message: MessageEvent) => {
      let event = new UpdateEvent();
      event.deserialize(JSON.parse(message.data));
      event.Box = aquabox.id;
      this.Updates.emit(event);
      this.showMessage(message.data);
    });
    ws.onError(() => {
      this.connected(aquabox.id, key, false);
    });
    ws.onClose(() => {
      this.connected(aquabox.id, key, false);
    });
  }

  addHost(configuration: AquaBoxConfiguration) {
    let box = new Aquabox(this, configuration);
    box.getDevices((devices: DevicesMap) => {
      if (devices.isEmpty()) {
        return;
      }
      this.hosts.insert(box);
      this.saveHosts();
    });
  }

  private baseUrl(aquabox: Aquabox) {
    let base = aquabox.configuration.protocol + "://"
      + aquabox.configuration.host + ":" + aquabox.configuration.rest.toString()
      + "/api/" + aquabox.configuration.api + "/";
    return base;
  }

  private async showMessage(text) {
    console.log(text);/*
    const toast = await this.toastController.create({
      message: text,
      showCloseButton: true,
      position: 'top',
      closeButtonText: 'Done',
    });
    toast.present();*/
  }

  private async apiError(error: HttpErrorResponse) {
    let err = "Error on making API call " + error.url +
              "\nFailed with: " + error.statusText +
              "\nDetails: " + error.message;
    console.log(err);
    const toast = await this.toastController.create({
      message: err,
      showCloseButton: true,
      position: 'top',
      closeButtonText: 'Done',
      duration: 10000
    });
    toast.present();
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
    this.http.get<Object>(this.baseUrl(box) + "devices")
      .subscribe((response) => {
        this.parseDevices(box, response, success)
      }, (error) => {
        this.apiError(error);
        if (fail)
          fail();
      });
  }

  getDevice(device: Device, box: Aquabox, success?: () => void, fail?: () => void) {
    this.http.get<Object>(this.baseUrl(box) + "device/" + device.id)
      .subscribe((response) => {
        device.deserialize(response)
        if (success) success();
      }, (error) => {
        this.apiError(error);
        if (fail) fail();
      });
  }

  controlDevice(dev: Device, box: Aquabox, action: ActionType, success?: (result: boolean) => void) {
    this.http.put<Object>(this.baseUrl(box) + "device/" + dev.id + "/" + action, {}).subscribe((response) => {
      dev.deserialize(response);
      if(success) success(true);
    }, (error) => {
      this.apiError(error);
      if(success) success(false);
    });
  }

  fetchRules(box: Aquabox, success: (rules: RulesMap) => void, fail?: () => void) {
    this.http.get<Object>(this.baseUrl(box) + "rules")
      .subscribe((response) => {
        this.parseRules(box, response, success)
      }, (error) => {
        this.apiError(error);
        if (fail)
          fail();
      });
  }

  fetchRulesForDevice(box: Aquabox, device: Device, success: (rules: RulesMap) => void, fail?: () => void) {
    this.http.get<Object>(this.baseUrl(box) + "rules/" + device.id)
      .subscribe((response) => {
        this.parseRules(box, response, success)
      }, (error) => {
        this.apiError(error);
        if (fail)
          fail();
      });
  }

  updateRule(box: Aquabox, rule: Rule, update: boolean, result: (result: boolean) => void) {

    let url = this.baseUrl(box) + "device/" + rule.device + "/rule";

    let data = JSON.stringify(rule.serialize());

    let req = update ? this.http.post<Object>(url, data)
                     : this.http.put<Object>(url, data);

    req.subscribe((response) => {
      if(result)
        result(true);
    }, (error) => {
      this.apiError(error);
      if(result) result(false);
    });
  }

  deleteRule(box: Aquabox, rule: Rule, result: (result: boolean) => void) {

    let url = this.baseUrl(box) + "rule/" + rule.id

    this.http.delete(url)
      .subscribe(() => {
        result(true);
      }, (error) => {
        this.apiError(error);
        result(false);
      });
  }
}
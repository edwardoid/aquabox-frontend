import { DevicesMap, RulesMap, HostsMap } from './id-map';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Rule } from './rule';
import { Injectable } from '@angular/core';
import { Device } from './device';
import { Aquabox, AquaBoxConfiguration } from './aquabox';

@Injectable({
  providedIn: 'root'
})
export class AquaBoxService {

  public hosts: HostsMap = undefined;

  constructor(private http: HttpClient,
              private storage: Storage) {

    storage.ready().finally(() => {
      this.fetchConfigurations();
    })
  }

  saveHosts() {
    let cfgs = [];
    for (let host of this.hosts.valuesArray()) {
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
      + aquabox.configuration.host + ":" + aquabox.configuration.port.toString()
      + "/api/" + aquabox.configuration.api + "/";
    return base;
  }

  private apiError(error: HttpErrorResponse) {
    console.log("Error on making API call " + error.url +
      "\nFailed with: " + error.statusText +
      "\nDetails: " + error.message);
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
      res.insert(r);
    }

    success(res);
  }

  fetchDevices(box: Aquabox, success: (devices: DevicesMap) => void, fail?: () => void) {
    this.http.get<Object>(this.baseUrl(box) + "devices")
      .subscribe((response) => {
        this.parseDevices(box, response, success)
      }, (error) => {
        this.apiError(error);
        if (fail)
          fail();
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
      result(true);
    }, (error) => {
      this.apiError(error);
      result(false);
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
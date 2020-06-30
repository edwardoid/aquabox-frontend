import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Rule } from './rule';
import { Injectable } from '@angular/core';
import { Device } from './device';
import { Aquabox, AquaBoxConfiguration } from './aquabox';
import { saveConfig } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})
export class AquaBoxService {

  public hosts: Map<string, Aquabox> = undefined;

  constructor(private http: HttpClient,
              private storage: Storage) {

    storage.ready().finally(() => {
      this.fetchConfigurations();
    })
  }

  saveHosts() {
    let cfgs = [];
    for (let id in this.hosts) {
      cfgs.push(this.hosts[id].configuration);
    }

    this.storage.set("hosts", JSON.stringify(cfgs))
  }

  async fetchConfigurations(lazy?: (hosts: Map<string, Aquabox>) => void) {
    await this.storage.get("hosts").then((hostsValue) => {
      this.hosts = new Map<string, Aquabox>();
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
        let cfg : AquaBoxConfiguration = hosts[i]
        let box = new Aquabox(this, cfg);
        this.hosts[cfg.id] = box;
      }

      if (lazy)
        lazy(this.hosts);
    });
  }

  getHosts(lazy?: (hosts: Map<string, Aquabox>) => void) {
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
    this.hosts[box.configuration.id] = box;
    this.saveHosts();
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

  private parseDevices(box: Aquabox, respose: Object, success: (devices: Device[]) => void) {
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

    let res = [];
    for (let o of raw) {
      let d = new Device(this, box);
      if (d.parse(o)) {
        res.push(d);
      }
    }

    success(res);
  }

  fetchDevices(box: Aquabox, success: (devices: Device[]) => void,
    fail: () => void) {
    this.http.get<Object>(this.baseUrl(box) + "devices")
      .subscribe((response) => {
        this.parseDevices(box, response, success)
      }, (error) => {
        this.apiError(error);
        fail();
      });
  }

  updateRule(box: Aquabox, rule: Rule, update: boolean, result: (result: boolean) => void) {

    let url = this.baseUrl(box) + "device/" + rule.device + "/rule";

    let data = rule.toJSONString();

    let req = update ? this.http.post<Object>(url, data)
                     : this.http.put<Object>(url, data);

    req.subscribe((response) => {
      result(true);
    }, (error) => {
      this.apiError(error);
      result(false);
    });
  }
}
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Device } from './device';
import { Aquabox } from './aquabox';

@Injectable({
  providedIn: 'root'
})
export class AquaBoxService {

  public hosts: Map<string, Aquabox>;

  constructor(private http: HttpClient) {
  }

  getHosts() {
    if (!this.hosts) {
      this.hosts = new Map<string, Aquabox>();
      this.hosts["localhost"] = new Aquabox(this, "localhost", "esargsyan-lnb", "esargsyan-lnb", 8974, "http", "v1");

    }

    return this.hosts;
  }

  private baseUrl(aquabox: Aquabox) {
    let base = aquabox.protocol + "://"
      + aquabox.host + ":" + aquabox.port.toString()
      + "/api/" + aquabox.api + "/";
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
    this.http.get<Object>(this.baseUrl(box) + "/devices")
      .subscribe((response) => {
        this.parseDevices(box, response, success)
      }, (error) => {
        this.apiError(error);
        fail();
      });
  }
}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {

  constructor() { }

  private locale: string = "EN";

  private DeviceTypes = {
    "EN" : {
      "light" : "Light",
      "air_pump": "Air pump",
      "water_pump": "Water pump",
      "external_filter": "Canister(external) filter",
      "internal_filter": "Filter (internal)",
      "airlift_filter": "Airlift filter",
      "sump": "SUMP",
      "heater": "Heater",
      "cooler": "Cooler",
      "feeder" : "Feeder",
      "dosator": "Dosator",
      "co2" : "CO2 system",
      "uv" : "UV Sterilizator",
      "ph_controller" : "pH Controller",
      "ph_meter" : "pH value meter",
      "thermometer": "Digital thermometer",
      "generic" : "Other"
    }
  }

  private Vendors = {
    "EN" : {
      "eheim" : "EHEIM",
      "juwel" : "Juwel",
      "dennerle" : "Dennerle",
      "aquael" : "Aquael",
      "jbl" : "JBL",
      "ada" : "ADA",
      "sera" : "Sera",
      "tetra" : "Tetra",
      "twinstar" : "Twinstar",
      "daytime" : "Daytime",
      "hydor" : "Hydor",
      "oase" : "Oase",
      "osram" : "OSRAM",
      "chihiros" : "Chihiros",
      "atman" : "Atman",
      "sunsun" : "SunSun",
      "jebo" : "Jebo",
      "dehner" : "Dehner",
      "collar" : "Collar",
      "other": "Other"
    }
  }

  private get(Mapped, Key) {
    return Mapped[this.locale][Key]
         ? Mapped[this.locale][Key]
         : Key;
  }

  deviceType(type: string) {
    return this.get(this.DeviceTypes, type);
  }

  vendor(vend: string) {
    return this.get(this.Vendors, vend);
  }
}

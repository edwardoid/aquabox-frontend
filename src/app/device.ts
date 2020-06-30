import { AquaBoxService } from './aqua-box.service';
import { Aquabox } from './aquabox';

export class Device {
    
    constructor(private service: AquaBoxService, private box: Aquabox) {
    }

    id: string;
    name: string;
    deviceClass: string;
    type: string;
    meta: Map<string, string>;
    showDetails: false


    parse(obj: Object) {
        this.id = obj["id"];
        this.name = obj["name"];
        this.type = obj["type"];
        this.deviceClass = obj["class"];
        this.meta = obj["meta"];
        return true;
    }

    image() {
        return this.box.protocol + "://" +
               this.box.host + ":" + this.box.port.toString() +
               "/static/img/logos/" + this.meta["vendor"] + ".png";
    }

    metaKeys() {
        return Array.from(Object.keys(this.meta));
    }

    metadata(key: string) {
        return this.meta[key]
    }
}
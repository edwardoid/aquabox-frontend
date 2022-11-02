import { AquaBoxService } from './aqua-box.service';
import { AquaboxInstance } from './aquabox-instance';
import { Serialize, Serializable, SerializeProperty } from 'ts-serializer';
import { RulesMap } from './id-map';

@Serialize({})
export class Device extends Serializable {

    constructor(private service: AquaBoxService, private box: AquaboxInstance) {
        super();
    }

    @SerializeProperty({})
    id: string;

    @SerializeProperty({})
    name: string;

    @SerializeProperty({})
    index: number;

    @SerializeProperty({})
    address: string;

    @SerializeProperty({ map: "on" })
    isOn: boolean

    @SerializeProperty({ map: "times" })
    times: number

    @SerializeProperty({ map: "measurement" })
    measurement: number

    round(precition: number) {
        return Math.round(Math.pow(10, precition) * this.measurement) / Math.pow(10, precition);
    }

    @SerializeProperty({ map: "class"})
    deviceClass: string;

    @SerializeProperty({})
    type: string;

    @SerializeProperty({ map: "rules_enabled" })
    rulesEnabled: boolean;

    @SerializeProperty({ map: "accepted" })
    accepted: boolean;

    @SerializeProperty({ map: "available" })
    available: boolean;

    @SerializeProperty({})
    meta: Map<string, string>;

    @SerializeProperty({})
    showDetails: false

    image() {
        let v = this.meta["vendor"];
        if (!v || v == "other") {
            return "/assets/" + this.type + ".png";
        }
        return "/assets/" + this.meta["vendor"] + ".png";
    }

    metaKeys() {
        return Array.from(Object.keys(this.meta));
    }

    metadata(key: string) {
        return this.meta[key]
    }

    rules(success: (rules: RulesMap) => void) {
        this.service.fetchRulesForDevice(this.box, this, success);
    }

    turnOn(success ?: (ok : boolean) => void) {
        this.service.controlDevice(this, this.box, "on", 1, success);
    }

    turnOff(success ?: (ok : boolean) => void) {
        this.service.controlDevice(this, this.box, "on", 0, success);
    }

    setValue(property: string, value: any, success ?: (ok : boolean) => void) {
        this.service.controlDevice(this, this.box, property, value, success);
    }

    update(success ?: (ok : boolean) => void) {
        this.service.updateDevice(this.box, this, success);
    }
}
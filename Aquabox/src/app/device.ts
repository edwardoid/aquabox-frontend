import { AquaBoxService } from './aqua-box.service';
import { Aquabox } from './aquabox';
import { Serialize, Serializable, SerializeProperty } from 'ts-serializer';
import { RulesMap } from './id-map';

@Serialize({})
export class Device extends Serializable {

    constructor(private service: AquaBoxService, private box: Aquabox) {
        super();
    }

    @SerializeProperty({})
    id: string = ""

    @SerializeProperty({})
    name: string = ""

    @SerializeProperty({})
    index: number = -1

    @SerializeProperty({})
    address: string = ""

    @SerializeProperty({ map: "on" })
    isOn: boolean = false

    @SerializeProperty({ map: "times" })
    times: number = 0

    @SerializeProperty({ map: "measurement" })
    measurement: number = 0

    round(precition: number) {
        return Math.round(Math.pow(10, precition) * this.measurement) / Math.pow(10, precition);
    }

    @SerializeProperty({ map: "class"})
    deviceClass: string = ""

    @SerializeProperty({})
    type: string = ""

    @SerializeProperty({ map: "rules_enabled" })
    rulesEnabled: boolean = false

    @SerializeProperty({ map: "accepted" })
    accepted: boolean = false

    @SerializeProperty({ map: "available" })
    available: boolean = false

    @SerializeProperty({})
    meta: Map<string, string> = new Map<string, string>()

    @SerializeProperty({})
    showDetails: boolean = false

    image() {
        let v = this.meta.get("vendor");
        if (!v || v == "other") {
            return "/assets/" + this.type + ".png";
        }
        return "/assets/" + this.meta.get("vendor") + ".png";
    }

    metaKeys() {
        return Array.from(Object.keys(this.meta));
    }

    metadata(key: string) {
        return this.meta.get(key);
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
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
    id: string;

    @SerializeProperty({})
    name: string;

    @SerializeProperty({})
    deviceClass: string;

    @SerializeProperty({})
    type: string;

    @SerializeProperty({})
    meta: Map<string, string>;

    @SerializeProperty({})
    showDetails: false

    image() {
        return this.box.configuration.protocol + "://" +
               this.box.configuration.host + ":" + this.box.configuration.port.toString() +
               "/static/img/logos/" + this.meta["vendor"] + ".png";
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
}
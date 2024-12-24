import { of } from 'rxjs';
import { Aquabox } from './aquabox';
import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';


@Serialize({})
export class UpdateEvent  extends Serializable {

    static Aquabox: string = "aquabox"
    static Network: string = "network"
    static Device: string = "device"
    static Rule: string = "rule"

    Box: string = ""

    @SerializeProperty({ map: "class" })
    Class: string = ""

    @SerializeProperty({ map: "sender" })
    Sender: string = ""

    @SerializeProperty({ map: "data" })
    Data: Object = new Object()

    @SerializeProperty({ map: "props"})
    Properties: Object = new Object()

    apply(source: Serializable) {
        let props = (Object)("*" in this.Properties ? this.Properties["*"] : this.Properties);
        this.applyOnObject(source, props);
    }

    applyOnObject(source: Serializable, properties: Object) {
        for (let p in properties) {
            if (!source._serializeMap) {
                (source as any)[p] = properties[p as keyof Object];
            }
            else if (source._serializeMap.hasOwnProperty(p)) {
                if(source._serializeMap[p].hasOwnProperty("type"))
                    continue;
                if(source._serializeMap[p].hasOwnProperty("list") && source._serializeMap[p]["list"])
                    continue;

                (source as any)[p] = properties[p as keyof Object];
            } else {
                for(let alias in source._serializeMap) {
                    if (source._serializeMap[alias].map == p) {
                        (source as any)[alias] = properties[p as keyof Object];
                        break;
                    }
                }
            }
        }
    }

}

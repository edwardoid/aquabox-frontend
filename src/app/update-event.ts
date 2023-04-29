import { AquaboxInstance } from './aquabox-instance';
import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';


@Serialize({})
export class UpdateEvent  extends Serializable {

    static Aquabox: string = "aquabox"
    static Network: string = "network"
    static Device: string = "device"
    static Rule: string = "rule"

    @SerializeProperty({ map: "boxId" })
    Box: string

    @SerializeProperty({ map: "class" })
    Class: string

    @SerializeProperty({ map: "sender" })
    Sender: string

    @SerializeProperty({ map: "data" })
    Data: object

    @SerializeProperty({ map: "properties"})
    Properties: object

    apply(source: Serializable) {
        var props = "*" in this.Properties ? this.Properties["*"] : this.Properties;
        this.applyOnObject(source, props);
    }

    applyOnObject(source: Serializable, properties: any) {
        for (let p in properties) {
            if (!source._serializeMap) {
                source[p] = properties[p];
            }
            else if (source._serializeMap.hasOwnProperty(p)) {
                if(source._serializeMap[p].hasOwnProperty("type"))
                    continue;
                if(source._serializeMap[p].hasOwnProperty("list") && source._serializeMap[p]["list"])
                    continue;

                source[p] = properties[p];
            } else {
                for(let alias in source._serializeMap) {
                    if (source._serializeMap[alias].map == p) {
                        source[alias] = properties[p];
                        break;
                    }
                }
            }
        }
    }

}

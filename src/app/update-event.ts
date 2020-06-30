import { Aquabox } from './aquabox';
import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';


@Serialize({})
export class UpdateEvent  extends Serializable {
    
    static Aquabox: string = "aquabox"
    static Device: string = "device"
    static Rule: string = "rule"

    Box: string

    @SerializeProperty({ map: "class" })
    Class: string

    @SerializeProperty({ map: "sender" })
    Sender: string

    @SerializeProperty({ map: "data" })
    Data: object

    @SerializeProperty({ map: "props"})
    Properties: object 

    apply(source: Serializable) {
        let props = "*" in this.Properties ? this.Properties["*"] : this.Properties; 
        this.applyOnObject(source, props);
    }

    applyOnObject(source: Serializable, properties: object) {
        if (source instanceof Aquabox) {
            if (properties["connected"]) {
                source["connected"] = properties["connected"];
            }
        }
        source.deserialize(properties);
    }
    
}

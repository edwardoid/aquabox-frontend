import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';


@Serialize({})
export class UpdateEvent  extends Serializable {
    
    Aquabox: string = "aquabox"
    Device: string = "device"
    Rule: string = "rule"

    Box: string

    @SerializeProperty({ map: "class" })
    Class: string

    @SerializeProperty({ map: "sender" })
    Sender: string

    @SerializeProperty({ map: "data" })
    Data: object

    @SerializeProperty({ map: "props"})
    Properties: object 

    apply(source: object) {
        let props = "*" in this.Properties ? this.Properties["*"] : this.Properties; 
        for(let p in props) {
            source[p] = this.Properties[p];
        }
    }
}

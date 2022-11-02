import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';
import { AquaBoxConfiguration } from './aquabox-instance';

@Serialize({})
export class RPCCommand extends Serializable {
    constructor(configuration?: AquaBoxConfiguration) {
        super();
        this.type = "command"
        if (configuration)
            this.params = { ":boxId" : configuration.serial }
    }
    @SerializeProperty({})
    public rqid: number
    @SerializeProperty({})
    public rpid: number
    @SerializeProperty({})
    public type: string
    @SerializeProperty({})
    public command: string
    @SerializeProperty({})
    public data = new Object
    @SerializeProperty({})
    public params = new Object;
    @SerializeProperty({})
    public result: number
}
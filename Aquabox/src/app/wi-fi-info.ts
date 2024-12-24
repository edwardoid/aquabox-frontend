import { Serialize, Serializable, SerializeProperty } from 'ts-serializer';
import { Security } from './security';

@Serialize({})
export class WiFiInfo extends Serializable {
    @SerializeProperty({ map: "ssid"})
    SSID: string = ""

    @SerializeProperty({})
    signal: number = -1

    @SerializeProperty({})
    encrypted: boolean = false

    @SerializeProperty({})
    password: string = ""

    @SerializeProperty({ map: "auth"})
    security: Security = Security.None

    @SerializeProperty({ map: "ip"})
    ip: string = "0.0.0.0"
}

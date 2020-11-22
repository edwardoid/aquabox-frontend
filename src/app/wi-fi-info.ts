import { Serialize, Serializable, SerializeProperty } from 'ts-serializer';
import { Security } from './Security';

@Serialize({})
export class WiFiInfo extends Serializable {
    @SerializeProperty({ map: "ssid"})
    SSID: string;

    @SerializeProperty({})
    signal: number

    @SerializeProperty({})
    encrypted: boolean

    @SerializeProperty({ map: "auth"})
    security: Security

    @SerializeProperty({ map: "ip"})
    ip: string;
}

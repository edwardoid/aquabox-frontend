import { Serialize, Serializable, SerializeProperty } from 'ts-serializer';

export enum NetworkStatus{
    Unknown = "unknown",
    Connected = "connected",
    Disconnected = "disconnected",
    AccessPoint = "ap"
}

@Serialize({})
export class BoxStatus extends Serializable {
    @SerializeProperty()
    host: string

    @SerializeProperty({ root: "network"})
    ip: string

    @SerializeProperty({ root: "network"})
    ssid: string

    @SerializeProperty({ root: "network" })
    mode: NetworkStatus = NetworkStatus.Unknown

    @SerializeProperty({})
    rest: number

    @SerializeProperty({})
    stream: number

    available: boolean
}

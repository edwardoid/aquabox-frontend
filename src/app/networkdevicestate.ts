
export enum NetworkDeviceState {
    Unknown = "unknown",
    Unmanaged = "unmanaged",
    Disconnected = "disconnected",
    Prepare = "prepare",
    Config = "config",
    NeedAuth = "need_auth",
    IpConfig = "ip_config",
    IpCheck = "ip_check",
    Secondaries = "secondaries",
    Activated = "activated",
    Deactivating = "deactivating",
    Failed = "failed"
}

export class NetworkDeviceStateConverter {
    static toString(state: NetworkDeviceState) {
        switch (state) {
            case NetworkDeviceState.Unknown: return "unknown";
            case NetworkDeviceState.Unmanaged: return "unmanaged";
            case NetworkDeviceState.Disconnected: return "disconnected";
            case NetworkDeviceState.Prepare: return "prepare";
            case NetworkDeviceState.Config: return "config";
            case NetworkDeviceState.NeedAuth: return "need_auth";
            case NetworkDeviceState.IpConfig: return "ip_config";
            case NetworkDeviceState.IpCheck: return "ip_check";
            case NetworkDeviceState.Secondaries: return "secondaries";
            case NetworkDeviceState.Activated: return "activated";
            case NetworkDeviceState.Deactivating: return "deactivating";
            case NetworkDeviceState.Failed: return "failed";
        }
    }

    static fromString(state: string) {
        switch (state) {
            case "unknown": return NetworkDeviceState.Unknown;
            case "unmanaged": return NetworkDeviceState.Unmanaged;
            case "disconnected": return NetworkDeviceState.Disconnected;
            case "prepare": return NetworkDeviceState.Prepare;
            case "config": return NetworkDeviceState.Config;
            case "need_auth": return NetworkDeviceState.NeedAuth;
            case "ip_config": return NetworkDeviceState.IpConfig;
            case "ip_check": return NetworkDeviceState.IpCheck;
            case "secondaries": return NetworkDeviceState.Secondaries;
            case "activated": return NetworkDeviceState.Activated;
            case "deactivating": return NetworkDeviceState.Deactivating;
            case "failed": return NetworkDeviceState.Failed;
        }
    }
}

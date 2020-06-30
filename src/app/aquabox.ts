import { DevicesMap, RulesMap } from './id-map';
import { Rule } from './rule';
import { Device } from './device';
import { AquaBoxService } from './aqua-box.service';
import { Serializable, Serialize } from 'ts-serializer';

export class AquaBoxConfiguration {
    public id: string = ""
    public hostname: string = ""
    public host: string = ""
    public port: number
    public protocol: string = "http"
    public api: string = "v1"
}

@Serialize({ root: "configuration"})
export class Aquabox extends Serializable {

    public id: string
    public devices: DevicesMap = new DevicesMap()
    public rules: RulesMap = new RulesMap()
    public internal: Object =  new Object()

    public constructor(private service: AquaBoxService,
                       public configuration: AquaBoxConfiguration) {
        super();
        this.id = this.configuration.id;

        service.attachForUpdates(this);
    }

    async getDevices(success: (devices: DevicesMap) => void, fail?: () => void) {
        await this.service.fetchDevices(
            this,
            (devices: DevicesMap) => {
                this.devices = devices;
                success(this.devices);
            },
            fail
        )
    }

    update(device: Device) {
        this.service.getDevice(device, this);
    }

    getRules(success: (rules: RulesMap) => void, fail?: () => void) {
        this.service.fetchRules(
            this,
            (rules: RulesMap) => {
                this.rules = rules;
                success(this.rules);
            },
            fail
        )
    }

    updateRule(rule: Rule, success ?: (result: boolean) => void) {
        this.service.updateRule(this, rule, true, success);
    }

    createRule(rule: Rule, success ?: (result: boolean) => void) {
        this.service.updateRule(this, rule, false, success);
    }

    deleteRule(rule: Rule, success ?: (result: boolean) => void) {
        this.service.deleteRule(this, rule, success);
    }
}

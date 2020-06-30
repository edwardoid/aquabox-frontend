import { UpdateConsumer } from './update-consumer';
import { DevicesMap, RulesMap } from './id-map';
import { Rule } from './rule';
import { Device } from './device';
import { AquaBoxService } from './aqua-box.service';
import { Serializable, Serialize } from 'ts-serializer';
import { UpdateEvent } from './update-event';

export class AquaBoxConfiguration {
    public id: string = ""
    public name: string = ""
    public host: string = ""
    public rest: number
    public stream: number
    public protocol: string = "http"
    public api: string = "v1"
    public startedAt: number
}

@Serialize({ root: "configuration"})
export class Aquabox extends Serializable{

    private updateConsumer: UpdateConsumer;
    public id: string
    public devices: DevicesMap = new DevicesMap()
    public rules: RulesMap = new RulesMap()
    public internal: Object =  new Object()
    public connected: boolean

    public constructor(public service: AquaBoxService,
                       public configuration: AquaBoxConfiguration) {
        super();
        this.id = this.configuration.id;
        this.updateConsumer = new UpdateConsumer(this.service, UpdateEvent.Aquabox, this.id, this.id);
        this.updateConsumer.subscribe(this);
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

import { BoxStatus } from './box-status';
import { DevicesMap, RulesMap } from './id-map';
import { Rule } from './rule';
import { AquaBoxService } from './aqua-box.service';
import { Serializable, Serialize } from 'ts-serializer';
import { UpdateEvent } from './update-event';
import { WiFiInfo } from './wi-fi-info'
import { PropertyUpdateEventConsumer } from './property-update-event-consumer';
import { UpdateConsumer } from './update-consumer';

export class AquaBoxConfiguration {
    public id: string = ""
    public name: string = ""
    public host: string = ""
    public rest: number
    public stream: number
    public protocol: string = "http"
    public api: string = "v1"
    public startedAt: number
    public serial: string
}

@Serialize({ root: "configuration"})
export class Aquabox extends Serializable{

    private updateConsumer: PropertyUpdateEventConsumer;
    private networkUpdateConsumer: UpdateConsumer;
    public id: string
    public devices: DevicesMap = new DevicesMap()
    public rules: RulesMap = new RulesMap()
    public internal: Object =  new Object()
    public connected: boolean
    public status: BoxStatus

    public constructor(public service: AquaBoxService,
                       public configuration: AquaBoxConfiguration) {
        super();
        this.id = this.configuration.id;
        this.updateConsumer = new PropertyUpdateEventConsumer(this.service, this);
        this.updateConsumer.setBoxFilter(this.id);
        this.updateConsumer.setEventClassFilter(UpdateEvent.Aquabox);
        this.updateConsumer.setSenderFilter(this.id);
        this.updateConsumer.subscribe();

        this.networkUpdateConsumer = new UpdateConsumer(this.service)
        this.networkUpdateConsumer.setBoxFilter(this.id);
        this.networkUpdateConsumer.setSenderFilter(configuration.serial);
        this.networkUpdateConsumer.setEventClassFilter(UpdateEvent.Network);
        this.networkUpdateConsumer.setEventHandler((event: UpdateEvent) => {
            this.getStatus();
        });
        this.networkUpdateConsumer.subscribe();
        this.getStatus();
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

    isCloudEnabled() {
        return this.configuration.host == this.service.APP_SERVER;
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

    getStatus(success ?: (result: boolean) => void) {
        this.service.getStatus(this, success);
    }

    scanForNetworks(success ?: (result: boolean) => void) {
        this.service.scanForNetworks(this, success);
    }

    getNetworks(success ?: (result: WiFiInfo[]) => void) {
        this.service.getNetworks(this, success);
    }

    connectToWifi(network: WiFiInfo, success ?: (uuid: string) => void) {
        this.service.connectToWifi(this, network, success);
    }
}

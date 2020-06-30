import { Rule } from './rule';
import { AquaBoxService } from './aqua-box.service';
import { Device } from './device';

export class AquaBoxConfiguration {
    public id: string = ""
    public hostname: string = ""
    public host: string = ""
    public port: number
    public protocol: string = "http"
    public api: string = "v1"
}

export class Aquabox {

    public devices: Device[] = []
    public rules: Rule[] = []

    public constructor(private service: AquaBoxService,
                       public configuration: AquaBoxConfiguration) {
    }

    getDevices(success: (devices: Device[]) => void, fail: () => void) {
        this.service.fetchDevices(
            this,
            (devices: Device[]) => {
                this.devices = devices;
                success(this.devices);
            },
            fail
        )
    }

    getDevice(id: string) {
        for (var i in this.devices) {
            if (this.devices[i].id == id) {
                return this.devices[i];
            }
        }

        return undefined;
    }

    updateRule(rule: Rule) {
        this.service.updateRule(this, rule, true, (result: boolean) => void {

        });
    }

    createRule(rule: Rule) {
        this.service.updateRule(this, rule, true, (result: boolean) => void {

        });
    }
}

import { UpdateConsumer } from './update-consumer';
import { Action } from './action';
import { AquaBoxService } from './aqua-box.service';
import { Aquabox } from './aquabox';
import { Repeat } from './repeat';
import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';
import { UpdateEvent } from './update-event';

/*
{
    "id" : "1",
    "enabled" : true,
    "device" : "dev1",
    "index" : 0,
    "lastRun" : 0,
    "actions": [
        {
            "type" : "turn_on",
            "at" : 1030
        },
        {
            "type" : "turn_off",
            "at" : 1830
        }
    ],
    "created_at": 125,
    "repeat": {
        "count" : 175,
        "unit" : "day"
    }
}
*/

@Serialize({})
export class Rule extends Serializable {
    private updates: UpdateConsumer;

    @SerializeProperty({})
    id: string = "-1";

    @SerializeProperty({})
    name: string = "";

    @SerializeProperty({})
    enabled: boolean = true;

    @SerializeProperty({})
    device: string = "";

    @SerializeProperty({})
    index: number = 0;

    @SerializeProperty({})
    lastRun: number = 0;

    @SerializeProperty({ list: true })
    actions: Action[] = [];

    @SerializeProperty({})
    created_at: number = 0;
    @SerializeProperty({ type: Repeat })
    repeat: Repeat = new Repeat();

    constructor(private box: Aquabox) {
        super()
        this.updates = new UpdateConsumer(box.service, UpdateEvent.Rule, this.id, box.id);
    }

    subscribeForUpdates() {
        this.updates.id = this.id;
        this.updates.subscribe(this);
    }

    save(success ?: (result: boolean) => void) {
        this.box.createRule(this, success);
    }

    update(success ?: (result: boolean) => void) {
        this.box.updateRule(this, success);
    }

    delete(success ?: (result: boolean) => void) {
        this.box.deleteRule(this, success);
    }
}
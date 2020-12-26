import { Action } from './action';
import { Aquabox } from './aquabox';
import { Repeat } from './repeat';
import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';
import { UpdateEvent } from './update-event';
import { PropertyUpdateEventConsumer } from './property-update-event-consumer';

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
    private updates: PropertyUpdateEventConsumer;

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
        this.updates = new PropertyUpdateEventConsumer(box.service, this);
        this.updates.setBoxFilter(box.id);
        this.updates.setEventClassFilter(UpdateEvent.Rule);
    }

    generateId() {
        if (!this.id || this.id.length == 0 || this.id == "-1") {
            let id = this.name + "_" + Math.floor(Math.random() * 1000000000000);
            let forbiddenSymbols = [" ", "/", ".", "\\", "\t"];
            for (let i of forbiddenSymbols) {
                id = id.split(i).join("_");
            }

            this.id = id;
        }
    }

    subscribeForUpdates() {
        this.updates.setSenderFilter(this.id)
        this.updates.subscribe();
    }

    save(success?: (result: boolean) => void) {
        this.box.createRule(this, success);
    }

    update(success?: (result: boolean) => void) {
        this.box.updateRule(this, success);
    }

    delete(success?: (result: boolean) => void) {
        this.box.deleteRule(this, success);
    }
}
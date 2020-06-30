import { Action } from './action';
import { AquaBoxService } from './aqua-box.service';
import { Aquabox } from './aquabox';
import { Repeat } from './repeat';

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

export class Rule {
    id: string = "-1";
    enabled: boolean = true;
    device: string = "";
    index: number = 0;
    lastRun: number = 0;
    actions: Action[] = [];
    created_at: number = 0;
    repeat: Repeat = new Repeat();

    constructor(private service: AquaBoxService) {
    }

    parse(obj: Object) {
        this.id = obj["id"];
        this.enabled = obj["enabled"];
        this.device = obj["device"];
        this.index = obj["index"];
        this.lastRun = obj["lastRun"];
        this.created_at = obj["createdAt"];
        this.repeat.parse(obj["repeat"]);
        this.actions = [];
        let actions = obj["actions"];
        if (Array.isArray(actions)) {
            for (let o of actions) {
                let a = new Action(undefined);
                if (a.parse(o))
                    this.actions.push(a);
            }
        }
        return true;
    }

    toJSONString() {
        return JSON.stringify(this, (key: string, value: any) => {
            if (key  == "service")
                return undefined
            if (key == "repeat")
                return value.toJSONObject();
            return value;
        });
    }

    save(box: Aquabox) {
        box.createRule(this);
    }

    update(box: Aquabox) {
        box.updateRule(this);
    }
}
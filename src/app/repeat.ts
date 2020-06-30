import { RepeatTimeout, RepeatTimeoutConverter } from './repeattimeoutunit';

export class Repeat {
    unit: RepeatTimeout = RepeatTimeout.Day;
    count: number = 0;
    constructor() {

    }
    parse(obj: Object) {
        this.count = obj["count"];
        this.unit = RepeatTimeoutConverter.fromString(obj["unit"]);
        return this.count != undefined && this.unit !== undefined;
    }

    toJSONObject() {
        return {
            "count" : this.count,
            "unit" : RepeatTimeoutConverter.toString(this.unit)
        };
    }
}
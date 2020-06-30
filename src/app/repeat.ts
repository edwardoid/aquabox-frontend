import { RepeatTimeout, RepeatTimeoutConverter } from './repeattimeoutunit';
import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';

@Serialize({})
export class Repeat  extends Serializable  {
    @SerializeProperty({})
    unit: RepeatTimeout = RepeatTimeout.Day;

    @SerializeProperty({})
    count: number = 0;

    constructor() {
        super();
    }

    toJSONObject() {
        return {
            "count" : this.count,
            "unit" : RepeatTimeoutConverter.toString(this.unit)
        };
    }
}
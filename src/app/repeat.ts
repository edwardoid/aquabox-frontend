import { RepeatTimeout, RepeatTimeoutConverter } from './repeattimeoutunit';
import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';

@Serialize({})
export class Repeat  extends Serializable  {
    @SerializeProperty({})
    unit: RepeatTimeout = RepeatTimeout.Hour;

    @SerializeProperty({})
    deleteAfter: number = 0;

    constructor() {
        super();
    }
}
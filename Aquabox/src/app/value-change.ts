import {Serialize, SerializeProperty, Serializable} from 'ts-serializer';

@Serialize({})
export class ValueChange  extends Serializable {

    @SerializeProperty({})
    public property: string | undefined

    @SerializeProperty({})
    public cron: string = ""

    @SerializeProperty({})
    public value: number = -1;

    @SerializeProperty({})
    public when: number = -1;

    constructor(property?: string) {
        super();
        this.property = property;
    }
}
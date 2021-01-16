import {Serialize, SerializeProperty, Serializable} from 'ts-serializer';

@Serialize({})
export class ValueChange  extends Serializable {

    @SerializeProperty({})
    public property: string;

    @SerializeProperty({})
    public when: number;

    @SerializeProperty({})
    public value: number;

    constructor(property?: string) {
        super();
        this.property = property;
    }
}
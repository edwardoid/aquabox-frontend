import { ActionType, ActionTypeConverter } from "./actiontype";
import {Serialize, SerializeProperty, Serializable} from 'ts-serializer';

@Serialize({})
export class Action  extends Serializable {

    @SerializeProperty({})
    public type: ActionType;

    public at: number;

    constructor(type?: ActionType) {
        super();
        this.at = 0;
        this.type = type;
    }

    name() {
        if (this.type == ActionType.TurnOn) {
            return "Turn On";
        }
        return "TurnOff"
    }

    toggleActionType() {
        this.type = this.type == ActionType.TurnOn ? ActionType.TurnOff : ActionType.TurnOn;
    }
}
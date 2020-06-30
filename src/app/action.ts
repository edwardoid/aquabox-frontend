import { ActionType, ActionTypeConverter } from "./actiontype";

export class Action {
    public type: ActionType;
    public at: Date;

    constructor(type: ActionType) {
        this.at = new Date(0);
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

    parse(obj: Object) {
        this.at = new Date(obj["at"]);
        this.type = ActionTypeConverter.fromString(obj["type"])
        return this.at !== undefined && this.type !== undefined;
    }
}
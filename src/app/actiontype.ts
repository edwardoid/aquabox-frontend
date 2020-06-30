export enum ActionType {
    TurnOn = "turn_on",
    TurnOff = "turn_off"
}

export class ActionTypeConverter {
    static toString(type: ActionType) {
        switch(type) {
            case ActionType.TurnOn: return "turn_on";
            case ActionType.TurnOff: return "turn_off";
        }
    }

    static fromString(type: string) {
        switch(type) {
            case "turn_on": return ActionType.TurnOn;
            case "turn_off": return ActionType.TurnOff;
        }
    }
}
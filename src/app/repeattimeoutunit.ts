
export enum RepeatTimeout{
    Minute,
    Hour,
    Day,
    Week,
    Month
}

export class RepeatTimeoutConverter {
    static toString(timeout: RepeatTimeout) {
        switch (timeout) {
            case RepeatTimeout.Minute: return "minute";
            case RepeatTimeout.Hour: return "hour";
            case RepeatTimeout.Day: return "day";
            case RepeatTimeout.Week: return "week";
            case RepeatTimeout.Month: return "month";
        }
    }

    static fromString(timeout: string) {
        switch (timeout) {
            case "minute" : return RepeatTimeout.Minute;
            case "hour" : return RepeatTimeout.Hour;
            case "day" : return RepeatTimeout.Day;
            case "week" : return RepeatTimeout.Week;
            case "month" : return RepeatTimeout.Month;
        }
    }
}
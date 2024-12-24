import { UpdateConsumer } from "./update-consumer";
import { UpdateEvent } from "./update-event";
import { Serializable } from 'ts-serializer';
import { AquaBoxService } from "./aqua-box.service";


export class PropertyUpdateEventConsumer extends UpdateConsumer {
    constructor(service: AquaBoxService, private target: Serializable, private starUpdateProcessorCb?: (update: Object) => void) {
        super(service)
    
        this.setEventHandler((event: UpdateEvent) => {
            if (!event.Properties["*" as keyof Object]) {
                event.apply(this.target);
            } else if (this.starUpdateProcessorCb) {
                this.starUpdateProcessorCb(event.Properties["*" as keyof Object]);
            } else {
                event.apply(this.target);
            }
        });
    }
}

import { UpdateEvent } from './update-event';
import { AquaBoxService } from './aqua-box.service';
import { Serializable } from 'ts-serializer';


export class UpdateConsumer {
    
    private starUpdateProcessorCb: (update: object) => void;

    constructor(private service: AquaBoxService, private consumerClass : string, public id: string, public boxId) {
    }

    setStarUpdateProcessor(processor: (update: object) => void) {
        this.starUpdateProcessorCb = processor;
    }

    subscribe(consumer: Serializable, starUpdateProcessorCb?: (update: object) => void) {
        if (starUpdateProcessorCb)
            this.setStarUpdateProcessor(starUpdateProcessorCb)
        let self = this;
        this.service.Updates.subscribe((event: UpdateEvent) => {
            if (event.Box != self.boxId) {
                return;
            }

            if (event.Class != self.consumerClass) {
                return;
            }

            if (event.Sender != self.id) {
                return;
            }

            if (!event.Properties["*"]) {
                event.apply(consumer);
            } else if(self.starUpdateProcessorCb) {
                self.starUpdateProcessorCb(event.Properties["*"]);
            } else {
                event.apply(consumer);
            }
        });
    }

    unsubscribe() {
        this.service.Updates.unsubscribe();
    }
}

import { UpdateEvent } from './update-event';
import { AquaBoxService } from './aqua-box.service';
import { Serializable } from 'ts-serializer';
import { send } from 'process';


export class UpdateConsumer {

    private handler: (event: UpdateEvent) => void;
    private id: string;
    private boxId: string;
    private consumerClass: string

    constructor(private service: AquaBoxService) {
    }

    setBoxFilter(boxId: string) {
        this.boxId = boxId;
    }

    setEventClassFilter(clazz: string) {
        this.consumerClass = clazz;
    }

    setSenderFilter(sender: string) {
        this.id = sender;
    }

    setEventHandler(handler: (event: UpdateEvent) => void) {
        this.handler = handler;
    }

    subscribe() {
        let self = this;
        this.service.Updates.subscribe((event: UpdateEvent) => {
            if (self.boxId != undefined && event.Box != self.boxId) {
                return;
            }

            if (self.consumerClass != undefined && event.Class != self.consumerClass) {
                return;
            }

            if (self.id != undefined && event.Sender != self.id) {
                return;
            }

            if (self.handler != undefined) {
                self.handler(event);
            }
        });
    }

    unsubscribe() {
        this.service.Updates.unsubscribe();
    }
}

import { $WebSocket } from "angular2-websocket";
import { AquaboxInstance } from "./aquabox-instance";
import { UpdateEvent } from "./update-event";


export class AquaboxStream {
    public onConnected: (box: AquaboxInstance, cloud: boolean, local: boolean) => void
    public onMessage: (box: AquaboxInstance, message: Object) => void;

    private local: $WebSocket;
    private localAvailable: boolean;
    private cloud: $WebSocket;
    private cloudAvailable: boolean;

    constructor(private box: AquaboxInstance,
        private localUrl: string,
        private cloudUrl: string) {
        this.localAvailable = false;
        this.cloudAvailable = false;
    }

    private emitConnectionChange() {
        this.onConnected(this.box, this.cloudAvailable, this.localAvailable);
    }

    private startLocal() {
        if (this.local && this.local.getReadyState() == 1) {
            return;
        }
        this.local = new $WebSocket(this.localUrl);

        this.local.onOpen(() => {
            this.localAvailable = true;
            this.emitConnectionChange();
            this.stopCloud();
        });
        this.local.onMessage((message: MessageEvent) => {
            this.onMessage(this.box, message.data);
        });
        this.local.onError(() => {
            this.localAvailable = false;
            this.emitConnectionChange();
            this.startCloud();
        });
        this.local.onClose(() => {
            this.localAvailable = false;
            this.emitConnectionChange();
            this.startCloud();
        })
    }

    private startCloud() {
        if (this.cloud && this.cloud.getReadyState() == 1) {
            return;
        }
        this.cloud = new $WebSocket(this.cloudUrl);

        this.cloud.onOpen(() => {
            this.cloudAvailable = true;
            this.emitConnectionChange();
            this.stopLocal();
        });
        this.cloud.onMessage((message: MessageEvent) => {
            if (!this.localAvailable) {
                this.onMessage(this.box, JSON.parse(message.data));
            }
        });
        this.cloud.onError(() => {
            this.cloudAvailable = false;
            this.emitConnectionChange();
            this.startLocal();
        });
        this.cloud.onClose(() => {
            this.cloudAvailable = false;
            this.emitConnectionChange();
            this.startLocal();
        })
    }

    private stopLocal() {
        if (this.local.getReadyState() == 1) {
            this.local.close();
        }
    }

    private stopCloud() {
        if (this.cloud.getReadyState() == 1) {
            this.cloud.close();
        }
    }

    public start(): void {
        this.startLocal();
        this.startCloud();
    }

    public stop(): void {
        this.stopLocal();
        this.stopCloud();
    }
}
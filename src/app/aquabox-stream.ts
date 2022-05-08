import { $WebSocket } from "angular2-websocket";
import { Aquabox } from "./aquabox";
import { UpdateEvent } from "./update-event";


export class AquaboxStream {
    public onConnected: (box: Aquabox, cloud: boolean, local: boolean) => void
    public onMessage: (box: Aquabox, message: Object) => void;
    public onDisconnected: (box: Aquabox) => void;

    private local: $WebSocket;
    private localAvailable: boolean;
    private cloud: $WebSocket;
    private cloudAvailable: boolean;

    constructor(private box: Aquabox,
        private localUrl: string,
        private cloudUrl: string) {
        this.localAvailable = false;
        this.cloudAvailable = false;
    }

    private emitConnectionChange() {
        if (this.localAvailable || this.cloudAvailable) {
            this.onConnected(this.box, this.cloudAvailable, this.localAvailable);
        } else {
            this.onDisconnected(this.box);
            this.start();
        }
    }

    private startLocal() {
        this.local = new $WebSocket(this.localUrl);

        this.local.onOpen(() => {
            this.localAvailable = true;
            this.emitConnectionChange();
        });
        this.local.onMessage((message: MessageEvent) => {
            this.onMessage(this.box, message.data);
        });
        this.local.onError(() => {
            this.localAvailable = false;
            this.emitConnectionChange();
        });
        this.local.onClose(() => {
            this.localAvailable = false;
            this.emitConnectionChange();
        })
    }

    private startCloud() {
        this.cloud = new $WebSocket(this.cloudUrl);

        this.cloud.onOpen(() => {
            this.cloudAvailable = true;
            this.emitConnectionChange();
        });
        this.cloud.onMessage((message: MessageEvent) => {
            if (!this.localAvailable) {
                this.onMessage(this.box, JSON.parse(message.data));
            }
        });
        this.cloud.onError(() => {
            this.cloudAvailable = false;
            this.emitConnectionChange();
        });
        this.cloud.onClose(() => {
            this.cloudAvailable = false;
            this.emitConnectionChange();
        })
    }

    public start(): void {
        this.startLocal();
        this.startCloud();
    }

    public stop(): void {
        this.local.close();
        this.cloud.close();
    }
}
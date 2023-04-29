import { $WebSocket } from "angular2-websocket";
import { RPCCommand } from "./rpc-command";

enum StreamState {
    DISCONNECTED = 0,
    CONNECTING,
    CONNECTED,
}

export class AquaboxRPC {

    public onConnected: (connected: boolean) => void
    public onEventMessage: (message: Object) => void;

    private ws: $WebSocket;
    private state: StreamState = StreamState.DISCONNECTED;
    private cloud_domain = "localhost:1214"
    
    private cmds = new Map<number, Object>();

    constructor(private url: string) {
        if (url == null || url === "")
            this.url = this.cloudUrl();
    }

    private cloudUrl()
    {
        return "ws://" + this.cloud_domain + "/api/v1/rpc";
    }

    public isAvailabe()
    {
        return this.state == StreamState.CONNECTED;
    }

    private emitConnectionChange() {
        if (this.onConnected)
            this.onConnected(this.state == StreamState.CONNECTED);
        this.cmds.forEach((value: Object, id: number) => {
            value["callback"](null, false);
        });
        this.cmds.clear();
    }

    private handleWSMessage = function (message: MessageEvent) {
        let raw = JSON.parse(message.data);
        if (raw['type'] == "event") // Supposed to be an event
        {
            if (this.onEventMessage)
                this.onEventMessage(raw);
        }
        else {
            let cmd = new RPCCommand();
            cmd.deserialize(raw);
            let p = this.cmds.get(cmd.rpid);
            if (p) {
                this.cmds.delete(cmd.rpid);
                p.callback(cmd, cmd.type == 'command');
            }
        }
    }

    public start() {
        if (this.state != StreamState.DISCONNECTED) {
            return;
        }
        if (this.ws == undefined || this.ws == null) {
            this.ws = new $WebSocket(this.url);
        }
        
        if (this.state == StreamState.DISCONNECTED)
        {

            this.state = StreamState.CONNECTING;

            this.ws.onOpen(() => {
                this.state = StreamState.CONNECTED;
                this.emitConnectionChange();
            });
            this.ws.onMessage((message: MessageEvent) => {
                this.state = StreamState.CONNECTED;
                this.handleWSMessage(message);
            });
            this.ws.onError(() => {
                this.state = StreamState.DISCONNECTED;
                this.emitConnectionChange();
            });
            this.ws.onClose(() => {
                this.state = StreamState.DISCONNECTED;
                this.emitConnectionChange();
            })

            this.ws.connect();
        }
    }

    public stop() {
        if (this.url == null)
            return;
        if (this.ws) {
            this.ws.close();
        }
    }

    public async runCommand(cmd: RPCCommand, result: (RPCCommand, boolean) => void) {
        cmd.rqid = Math.round(Math.random() * 9999999);
        cmd.params[":appId"] = "testApp";
        this.cmds.set(cmd.rqid, { when: Date.now(), command: cmd, callback: result })
        if (this.ws) {
            let msg = JSON.stringify(cmd);
            this.ws.send(msg).subscribe();
        }
    }
}
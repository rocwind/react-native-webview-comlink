import {
    Message,
    Channel,
    WireValue,
    MessageType,
    fromWireValue,
    toWireValue,
    WireValueType,
    Transmitter,
} from './message';
import { generateUUID } from './uuid';

export interface Endpoint {
    postMessage(msg: string): void;
}

interface ResolveRef {
    current?: Function;
}

type HubMessage = Message & {
    id: string;
};

export class MessageHub implements Channel {
    private tag: string;

    private receiverByID: Record<string, Function> = {};

    private resolveRefByRequestID: Record<string, ResolveRef> = {};

    private registry: FinalizationRegistry<() => void>;

    constructor(name: string, private endpoint: Endpoint) {
        this.tag = `RNWC|${name}|`;

        if (typeof FinalizationRegistry !== 'undefined') {
            this.registry = new FinalizationRegistry((release) => {
                release();
            });
        }
    }

    sendMessage(msg: Message, id: string = ''): void {
        this.endpoint.postMessage(
            this.tag +
                JSON.stringify({
                    ...msg,
                    id,
                }),
        );
    }

    requestResponse(msg: Message): Promise<WireValue> {
        let resolveRef = {
            current: undefined,
        };
        const result = new Promise<WireValue>((resolve) => {
            resolveRef.current = resolve;
        });

        const id = generateUUID();
        this.resolveRefByRequestID[id] = resolveRef;

        this.sendMessage(msg, id);
        return result;
    }

    registerReceiver(id: string, receiver: Function): void {
        this.receiverByID[id] = receiver;
    }

    registerTransmitter(transmitter: Transmitter): void {
        if (this.registry) {
            this.registry.register(transmitter, transmitter.release);
        }
    }

    canHandleMessage(msg: string): boolean {
        return msg?.startsWith(this.tag);
    }

    handleMessage(msg: string): void {
        const data: HubMessage = JSON.parse(msg.substr(this.tag.length));
        switch (data.type) {
            case MessageType.REQUEST: {
                const { target, argumentList, id } = data;
                Promise.resolve()
                    .then(() => {
                        const receiver = this.receiverByID[target];
                        if (!receiver) {
                            throw new Error(`failed to invoke, ${target} is missing`);
                        }
                        return receiver.apply(
                            null,
                            argumentList.map((arg) => fromWireValue(arg, this)),
                        );
                    })
                    .then((value) => {
                        this.sendMessage(
                            {
                                type: MessageType.RESPONSE,
                                returnValue: toWireValue(value, this),
                            },
                            id,
                        );
                    })
                    .catch((error) => {
                        const wireValue = toWireValue(error, this);
                        wireValue.type = WireValueType.THROW;
                        this.sendMessage(
                            {
                                type: MessageType.RESPONSE,
                                returnValue: wireValue,
                            },
                            id,
                        );
                    });
                break;
            }
            case MessageType.RESPONSE: {
                const { id, returnValue } = data;
                const resolveRef = this.resolveRefByRequestID[id];
                if (!resolveRef) {
                    return;
                }
                delete this.resolveRefByRequestID[id];
                resolveRef.current?.(returnValue);
                break;
            }

            case MessageType.RELEASE: {
                const { target } = data;
                if (this.receiverByID.hasOwnProperty(target)) {
                    delete this.receiverByID[target];
                }
                break;
            }
            default:
                break;
        }
    }
}

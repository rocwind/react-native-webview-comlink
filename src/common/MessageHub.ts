import {
    Message,
    Channel,
    WireValue,
    MessageType,
    fromWireValue,
    toWireValue,
    WireValueType,
    RemoteFunction,
    RequestMessage,
    ReleaseMessage,
} from './message';
import { ArrayMap, FakeWeakRef, WeakRefType } from './utils';
import { Logger } from './logger';

export interface Endpoint {
    postMessage(msg: string): void;
}

export class MessageHub implements Channel {
    private tag: string;

    private localFunctionByID: Record<
        number,
        {
            localFunction: Function;
            vid: number;
        }
    > = {};
    private localFunctionIDByFunction =
        typeof Map !== 'undefined' ? new Map<Function, number>() : new ArrayMap<Function, number>();

    private resolveByRequestID: Record<number, Function> = {};

    private remoteFunctionRefByID: Record<number, WeakRefType<RemoteFunction>> = {};
    private remoteFunctionRegistry: FinalizationRegistry<() => void>;

    constructor(name: string, private endpoint: Endpoint, private logger: Logger) {
        this.tag = `RNWC|${name}|`;

        if (typeof FinalizationRegistry !== 'undefined') {
            this.remoteFunctionRegistry = new FinalizationRegistry((cleanup) => {
                cleanup();
            });
        }
    }

    private sendMessage(msg: Message): void {
        this.endpoint.postMessage(this.tag + JSON.stringify(msg));
    }

    notifyRelease(msg: ReleaseMessage): void {
        this.sendMessage(msg);
    }

    requestResponse(msg: RequestMessage): Promise<WireValue> {
        return new Promise<WireValue>((resolve) => {
            this.resolveByRequestID[msg.rid] = resolve;
            this.sendMessage(msg);
        });
    }

    registerLocalFunction(id: number, vid: number, localFunction: Function): void {
        if (this.localFunctionByID.hasOwnProperty(id)) {
            // update only the vid if the function is already registered
            this.localFunctionByID[id].vid = vid;
            return;
        }

        this.localFunctionByID[id] = {
            localFunction,
            vid,
        };
        this.localFunctionIDByFunction.set(localFunction, id);
    }

    tryGetLocalFuntionID(localFunction: Function): number {
        return this.localFunctionIDByFunction.get(localFunction);
    }

    registerRemoteFunction(id: number, remoteFunction: RemoteFunction): void {
        this.remoteFunctionRefByID[id] =
            typeof WeakRef !== 'undefined'
                ? new WeakRef(remoteFunction)
                : new FakeWeakRef(remoteFunction);

        if (this.remoteFunctionRegistry) {
            this.remoteFunctionRegistry.register(
                remoteFunction,
                remoteFunction.cleanup,
                remoteFunction,
            );
        }
    }

    unregisterRemoteFunction(id: number): void {
        const remoteFunction = this.tryGetRemoteFunction(id);
        if (!remoteFunction) {
            return;
        }
        delete this.remoteFunctionRefByID[id];
        if (this.remoteFunctionRegistry) {
            this.remoteFunctionRegistry.unregister(remoteFunction);
        }
    }

    tryGetRemoteFunction(id: number): RemoteFunction {
        return this.remoteFunctionRefByID[id]?.deref();
    }

    canHandleMessage(msg: string): boolean {
        return msg?.startsWith(this.tag);
    }

    handleMessage(msg: string): void {
        const data: Message = JSON.parse(msg.substr(this.tag.length));
        switch (data.type) {
            case MessageType.REQUEST: {
                const { id, args, rid } = data;
                Promise.resolve()
                    .then(() => {
                        const localFunction = this.localFunctionByID[id]?.localFunction;
                        if (!localFunction) {
                            throw new Error(`failed to invoke function, ${id} is missing`);
                        }
                        return localFunction.apply(
                            null,
                            args.map((arg) => fromWireValue(arg, this)),
                        );
                    })
                    .then((value) => {
                        this.sendMessage({
                            type: MessageType.RESPONSE,
                            ret: toWireValue(value, this),
                            rid,
                        });
                    })
                    .catch((error) => {
                        const wireValue = toWireValue(error, this);
                        wireValue.type = WireValueType.THROW;
                        this.sendMessage({
                            type: MessageType.RESPONSE,
                            ret: wireValue,
                            rid,
                        });
                    });
                break;
            }

            case MessageType.RESPONSE: {
                const { rid, ret } = data;
                const resolve = this.resolveByRequestID[rid];
                if (!resolve) {
                    return;
                }
                delete this.resolveByRequestID[rid];
                resolve(ret);
                break;
            }

            case MessageType.RELEASE: {
                const { id, vid } = data;
                if (vid === this.localFunctionByID[id]?.vid) {
                    this.logger(`release local function: ${id}`);
                    this.localFunctionIDByFunction.delete(this.localFunctionByID[id].localFunction);
                    delete this.localFunctionByID[id];
                } else {
                    this.logger(`not release local function: ${id}, ${vid}`);
                }
                break;
            }

            default:
                break;
        }
    }
}

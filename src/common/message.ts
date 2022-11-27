import { generateID } from './utils';



export const enum WireValueType {
    RAW = 'R',
    PROXY = 'P',
    THROW = 'T',
}

interface RawWireValue {
    type: WireValueType.RAW;
    val: unknown;
}

interface ThrowWireValue {
    type: WireValueType.THROW;
    val: unknown;
}

interface ProxyWireValue {
    type: WireValueType.PROXY;
    id: number;
    /**
     * vid (version id) is the version of the proxy.
     * it is used to detect if the proxy is being send to remote
     * and local function cannot be released.
     */
    vid: number;
}

export type WireValue = RawWireValue | ThrowWireValue | ProxyWireValue;

export const enum MessageType {
    REQUEST = 'REQ',
    RESPONSE = 'RSP',
    RELEASE = 'RLS',
}
export interface RequestMessage {
    type: MessageType.REQUEST;
    id: number;
    rid: number;
    args: WireValue[];
}
export interface ResponseMessage {
    type: MessageType.RESPONSE;
    rid: number;
    ret?: WireValue;
}

export interface ReleaseMessage {
    type: MessageType.RELEASE;
    id: number;
    vid: number;
}

export type Message = RequestMessage | ResponseMessage | ReleaseMessage;

export type Remote<T> = T & {
    release(): number;
};

export type RemoteFunction = Remote<Function> & {
    addRef(vid: number): number;
    cleanup(): void;
};

// Channel that handle messages
export interface Channel {
    notifyRelease(msg: ReleaseMessage): void;
    requestResponse(msg: RequestMessage): Promise<WireValue>;
    registerLocalFunction(id: number, vid: number, localFunction: Function): void;
    tryGetLocalFuntionID(localFunction: Function): number;
    registerRemoteFunction(id: number, remoteFunction: RemoteFunction): void;
    unregisterRemoteFunction(id: number): void;
    tryGetRemoteFunction(id: number): RemoteFunction;
}

export function toWireValue(value: unknown, channel: Channel): WireValue {
    // proxy function
    if (typeof value === 'function') {
        let id = channel.tryGetLocalFuntionID(value);
        if (!id) {
            id = generateID();
        }
        const vid = generateID();
        channel.registerLocalFunction(id, vid, value);

        return {
            type: WireValueType.PROXY,
            id,
            vid,
        };
    }

    if (value instanceof Error) {
        const { message, name, stack, ...rest } = value;
        return {
            type: WireValueType.RAW,
            val: {
                message,
                ...rest,
            },
        };
    }

    // raw value
    return {
        type: WireValueType.RAW,
        val: value,
    };
}

export function fromWireValue(value: WireValue, channel: Channel): unknown {
    console.log("fromWireValue :: value "+JSON.stringify(value));
    console.log("fromWireValue :: channel "+JSON.stringify(channel));
    switch (value.type) {
        case WireValueType.RAW:
            return value.val;
        case WireValueType.PROXY:
            const { id, vid } = value;
            let remoteFunction = channel.tryGetRemoteFunction(id);
            if (remoteFunction) {
                remoteFunction.addRef(vid);
            } else {
                remoteFunction = createRemoteFunction(id, vid, channel);
                channel.registerRemoteFunction(id, remoteFunction);
            }
            return remoteFunction;
        case WireValueType.THROW:
            const { message, ...rest } = value.val as { message?: string };
            return Object.assign(new Error(message), rest);
        default:
            return undefined;
    }
}

export function createRemoteFunction(id: number, vid: number, channel: Channel): RemoteFunction {
    console.log("createRemoteFunction :: id "+id+ " vid: "+vid);
    console.log("createRemoteFunction :: channel "+channel);
    let refCount = 1;
    let latestVid = vid;
    const cleanup = () => {
        if (refCount <= 0) {
            return;
        }

        refCount = 0;
        channel.unregisterRemoteFunction(id);
        channel.notifyRelease({
            type: MessageType.RELEASE,
            id,
            vid: latestVid,
        });
    };
    return Object.assign(
        (...args: unknown[]) => {
            console.log("channel:: "+JSON.stringify(channel));
            return channel
                .requestResponse({
                    type: MessageType.REQUEST,
                    id,
                    rid: generateID(),
                    args: args.map((arg) => toWireValue(arg, channel)),
                })
                .then((response) => {
                    if (!response) {
                        return;
                    }
                    const value = fromWireValue(response, channel);
                    if (value instanceof Error) {
                        throw value;
                    }

                    return value;
                });
        },
        {
            addRef: (vid) => {
                if (refCount <= 0) {
                    return 0;
                }
                latestVid = vid;
                refCount += 1;
                return refCount;
            },
            release: () => {
                if (refCount <= 0) {
                    return 0;
                }
                if (refCount === 1) {
                    cleanup();
                    return refCount;
                }

                refCount -= 1;
                return refCount;
            },
            cleanup,
        },
    );
}

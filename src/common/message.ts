import { generateUUID } from './uuid';

// receiver transmitter
export const enum WireValueType {
    RAW = 'RAW',
    PROXY = 'PROXY',
    THROW = 'THROW',
}

export interface WireValue {
    type: WireValueType;
    value: unknown;
}

export const enum MessageType {
    REQUEST = 'REQUEST',
    RESPONSE = 'RESPONSE',
    RELEASE = 'RELEASE',
}

export interface RequestMessage {
    type: MessageType.REQUEST;
    target: string;
    argumentList: WireValue[];
}

export interface ResponseMessage {
    type: MessageType.RESPONSE;
    returnValue?: WireValue;
}

interface ReleaseMessage {
    type: MessageType.RELEASE;
    target: string;
}

export type Message = RequestMessage | ResponseMessage | ReleaseMessage;

export type WithRelease<T> = T & {
    release(): void;
};

export type Transmitter = WithRelease<Function>;

//
export interface Channel {
    sendMessage(msg: Message): void;
    requestResponse(msg: Message): Promise<WireValue>;
    registerReceiver(id: string, receiver: Function): void;
    registerTransmitter(transmitter: Transmitter): void;
}

export function toWireValue(value: unknown, channel: Channel): WireValue {
    // proxy function
    if (typeof value === 'function') {
        const id = generateUUID();
        channel.registerReceiver(id, value);

        return {
            type: WireValueType.PROXY,
            value: id,
        };
    }

    if (value instanceof Error) {
        const { message, name, stack, ...rest } = value;
        return {
            type: WireValueType.RAW,
            value: {
                message,
                ...rest,
            },
        };
    }

    // raw value
    return {
        type: WireValueType.RAW,
        value,
    };
}

export function fromWireValue(value: WireValue, channel: Channel): unknown {
    switch (value.type) {
        case WireValueType.RAW:
            return value.value;
        case WireValueType.PROXY:
            const transmitter = createTransmitter(value.value as string, channel);
            channel.registerTransmitter(transmitter);
            return transmitter;
        case WireValueType.THROW:
            const { message, ...rest } = value.value as { message?: string };
            return Object.assign(new Error(message), rest);
        default:
            return undefined;
    }
}

export function createTransmitter(id: string, channel: Channel): Transmitter {
    let hasReleased = false;
    return Object.assign(
        (...args: unknown[]) => {
            return channel
                .requestResponse({
                    type: MessageType.REQUEST,
                    target: id,
                    argumentList: args.map((arg) => toWireValue(arg, channel)),
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
            release: () => {
                if (hasReleased) {
                    return;
                }
                hasReleased = true;
                channel.sendMessage({
                    type: MessageType.RELEASE,
                    target: id,
                });
            },
        },
    );
}

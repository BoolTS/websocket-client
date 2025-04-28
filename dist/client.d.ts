export type TConfig = Required<{
    url: string;
}> & Partial<{
    reconnectInterval: number;
    maxReconnectAttempts: number;
    debug: boolean;
}>;
export declare class SocketClient<TCustomEventMap extends Record<string, unknown> = Record<string, unknown>> {
    #private;
    constructor({ url, reconnectInterval, maxReconnectAttempts, debug }: TConfig);
    connect(): this;
    disconnect(): this;
    sendJson<T extends keyof TCustomEventMap>(event: T, data: TCustomEventMap[T]): this;
    get readyState(): number | undefined;
}

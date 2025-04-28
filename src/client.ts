export type TConfig = Required<{
    url: string;
}> &
    Partial<{
        reconnectInterval: number;
        maxReconnectAttempts: number;
        debug: boolean;
    }>;

export class SocketClient<
    TCustomEventMap extends Record<string, unknown> = Record<string, unknown>
> {
    #socket: WebSocket | undefined;
    #configuration: Required<TConfig>;
    #retriedCount = 0;

    #openListener = this.#onOpen.bind(this);
    #closeListener = this.#onClose.bind(this);
    #errorListener = this.#onError.bind(this);
    #messageListener = this.#onMessage.bind(this);

    constructor({ url, reconnectInterval, maxReconnectAttempts, debug }: TConfig) {
        this.#configuration = {
            url: url,
            debug: debug || false,
            reconnectInterval:
                !reconnectInterval || reconnectInterval < 100 ? 100 : reconnectInterval,
            maxReconnectAttempts:
                !maxReconnectAttempts || maxReconnectAttempts < 1 ? 0 : maxReconnectAttempts
        };
    }

    connect() {
        if (!this.#socket || this.#socket.readyState === WebSocket.CLOSED) {
            this.#socket = new WebSocket(this.#configuration.url);
            this.#socket.addEventListener("open", this.#openListener);
            this.#socket.addEventListener("close", this.#closeListener);
            this.#socket.addEventListener("error", this.#errorListener);
            this.#socket.addEventListener("message", this.#messageListener);
        }

        return this;
    }

    disconnect() {
        if (this.#socket) {
            this.#socket.close();
        }

        return this;
    }

    sendJson<T extends keyof TCustomEventMap>(event: T, data: TCustomEventMap[T]) {
        if (!this.#socket) {
            throw new Error("WebSocket is not connected");
        }

        this.#configuration.debug && console.info("WebSocket message sent", event, data);
        this.#socket.send(JSON.stringify({ event, data }));

        return this;
    }

    #onOpen(event: Event) {
        this.#configuration.debug && console.info(event);

        this.#retriedCount = 0;
    }

    #onClose(event: CloseEvent) {
        this.#configuration.debug && console.info("WebSocket connection closed", event);

        if (!this.#socket) {
            return;
        }

        this.#socket.removeEventListener("open", this.#openListener);
        this.#socket.removeEventListener("close", this.#closeListener);
        this.#socket.removeEventListener("error", this.#errorListener);
        this.#socket.removeEventListener("message", this.#messageListener);
        this.#socket = undefined;

        if (event.code === 1000) {
            return;
        }

        setTimeout(() => {
            this.#reconnect();
        }, this.#configuration.reconnectInterval);
    }

    #onError(event: Event) {
        this.#configuration.debug && console.error("WebSocket error", event);
    }

    #onMessage(event: MessageEvent) {
        this.#configuration.debug && console.info("WebSocket message received", event);
    }

    #reconnect() {
        if (this.#retriedCount >= this.#configuration.maxReconnectAttempts) {
            return;
        }

        if (this.#configuration.maxReconnectAttempts < 1) {
            return this.connect();
        }

        if (this.#retriedCount < this.#configuration.maxReconnectAttempts) {
            this.#retriedCount++;
            this.connect();
        }
    }

    get readyState() {
        return this.#socket?.readyState;
    }
}

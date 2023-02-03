import EventEmitter2 from "eventemitter2";
import MQTT, { ErrorWithInvocationContext, Message, MQTTError, Qos, WithInvocationContext } from "paho-mqtt";
import TypedEmitter from "typed-emitter";

type MessageEvents = {
  connectionLost: (error: MQTTError) => void;
  messageArrived: (message: Message) => void;
  messageDelivered: (message: Message) => void;
  connected: (o: WithInvocationContext) => void;
  error: (o: ErrorWithInvocationContext) => void;
};

export default class CustomClient extends (EventEmitter2 as unknown as new () => TypedEmitter<MessageEvents>) {
  private client: MQTT.Client;

  constructor(host: string, port: number,clientId: string) {
    super();
    this.client = new MQTT.Client(host, port, clientId);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onMessageDelivered = this.onMessageDelivered.bind(this);
  }

  get isConnected(): boolean {
    return this.client.isConnected();
  }

  connect(options: MQTT.ConnectionOptions | undefined) {
    this.client.connect({
      ...options,
      onSuccess: (o) => this.emit("connected", o),
      onFailure: (o) => this.emit("error", o),
    });
  }

  disconnect() {
    this.client.disconnect();
  }

  subscribe(topic: string, options: MQTT.SubscribeOptions | undefined) {
    this.client.subscribe(topic, options);
  }

  unsubscribe(topic: string, options: MQTT.UnsubscribeOptions | undefined) {
    this.client.unsubscribe(topic, options);
  }

  publish(topic: string, payload: string | ArrayBuffer, qos?: Qos, retained?: boolean) {
    this.client.send(topic, payload, qos, retained);
  }

  onConnectionLost(responseObject: MQTTError) {
    this.emit("connectionLost" as const, responseObject);
  }

  onMessageArrived(message: Message) {
    this.emit("messageArrived" as const, message);
  }

  onMessageDelivered(message: Message) {
    this.emit("messageDelivered" as const, message);
  }
}

import MQTT, { Message } from 'paho-mqtt';
import CustomClient from './CustomClient';

export interface Error {
  name: string;
  message: string;
  stack?: string;
}

export enum ConnectionStatus {
  Connected = 'Connected',
  Connecting = 'Connecting',
  Reconnecting = 'Reconnecting',
  Offline = 'Offline',
  Error = 'Error',
}

export interface ConnectorProps {
  host: string;
  port: number;
  clientId: string;
  options?:  MQTT.ConnectionOptions
  parserMethod?: (message: Message) => string;
  children: React.ReactNode;
}

export interface IMqttContext {
  connectionStatus: ConnectionStatus;
  error?: Paho.MQTT.ErrorWithInvocationContext;
  client?: CustomClient | null;
  parserMethod?: (message: Message) => string;
}

export interface IMessageStructure {
  [key: string]: string;
}

export interface IMessage {
  topic: string;
  message?: string | IMessageStructure;
}

export interface IUseSubscription {
  topic: string | string[];
  client?: CustomClient | null;
  message?: IMessage;
  connectionStatus: ConnectionStatus;
  error?: Paho.MQTT.ErrorWithInvocationContext;
}
import {Client, ConnectionOptions, Message} from 'paho-mqtt';

export interface Error {
  name: string;
  message: string;
  stack?: string;
}

export interface MqttProviderProps {
  brokerUrl: string;
  clientId: string;
  options?: ConnectionOptions;
  parserMethod?: (message: Message) => string;
  children: React.ReactNode;  
}

export interface ConnectorProps {
  brokerUrl: string;
  options?: ConnectionOptions;
  parserMethod?: (message: Message) => string;
  children: React.ReactNode;
}

export interface IMqttContext {
  connectionStatus: string | Error;
  client?: Client | null;
  parserMethod?: (message: any) => string;
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
  client?: Client | null;
  message?: IMessage;
  connectionStatus: string | Error;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
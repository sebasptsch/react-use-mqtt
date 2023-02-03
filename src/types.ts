import type { MqttClient, IClientOptions, OnMessageCallback } from 'precompiled-mqtt';

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
  brokerUrl: string;
  options?: IClientOptions;
  parserMethod?: (...message: MessageArguments) => string;
  children: React.ReactNode;
}

export interface IMqttContext {
  connectionStatus: ConnectionStatus;
  error?: Error;
  client?: MqttClient | null;
  parserMethod?: (...message: MessageArguments) => string;
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
  client?: MqttClient | null;
  message?: IMessage;
  connectionStatus: ConnectionStatus;
  error?: Error;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export type MessageArguments = ArgumentTypes<OnMessageCallback>;
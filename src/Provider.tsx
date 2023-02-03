import React, { useEffect, useState, useMemo, useRef } from 'react';

import MQTT from 'precompiled-mqtt/dist/mqtt.browser.js';

import MqttContext from './Context';
import { Error, ConnectorProps, IMqttContext, ConnectionStatus } from './types';



export default function Connector({
  children,
  brokerUrl,
  options = { keepalive: 0 },
  parserMethod,
}: ConnectorProps) {
  // Using a ref rather than relying on state because it is synchronous
  const clientValid = useRef(false);
  const [connectionStatus, setStatus] = useState<ConnectionStatus>(ConnectionStatus.Offline);
  const [error, setError] = useState<Error | undefined>();
  const [client, setClient] = useState<MQTT.MqttClient | null>(null);

  useEffect(() => {
    if (!client && !clientValid.current) {
      // This synchronously ensures we won't enter this block again
      // before the client is asynchronously set
      clientValid.current = true;
      setStatus(ConnectionStatus.Connecting);
      console.log(`attempting to connect to ${brokerUrl}`);
      const mqtt = MQTT.connect(brokerUrl, options);
      mqtt.on('connect', () => {
        console.debug('on connect');
        setStatus(ConnectionStatus.Connected);
        setError(undefined);
        // For some reason setting the client as soon as we get it from connect breaks things
        setClient(mqtt);
      });
      mqtt.on('reconnect', () => {
        console.debug('on reconnect');
        setStatus(ConnectionStatus.Reconnecting);
        setError(undefined);
      });
      mqtt.on('error', err => {
        console.log(`Connection error: ${err}`);
        setStatus(ConnectionStatus.Error);
        setError(err);
      });
      mqtt.on('offline', () => {
        console.debug('on offline');
        setStatus(ConnectionStatus.Offline);
        setError(undefined);
      });
      mqtt.on('end', () => {
        console.debug('on end');
        setStatus(ConnectionStatus.Offline);
        setError(undefined);
      });
    }
  }, [client, clientValid, brokerUrl, options]);

  // Only do this when the component unmounts
  useEffect(
    () => () => {
      if (client) {
        console.log('closing mqtt client');
        client.end(true);
        setClient(null);
        clientValid.current = false;
      }
    },
    [client, clientValid],
  );

  // This is to satisfy
  // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-constructed-context-values.md
  const value: IMqttContext = useMemo<IMqttContext>(
    () => ({
      connectionStatus,
      client,
      parserMethod,
      error,
    }),
    [connectionStatus, client, parserMethod],
  );

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
}
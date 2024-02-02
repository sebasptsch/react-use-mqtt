import React, { useEffect, useState, useMemo, useRef } from 'react';


import MqttContext from './Context';
import { ConnectorProps, IMqttContext, ConnectionStatus, isURI } from './types';
import CustomClient from './CustomClient';



export default function Connector(props: ConnectorProps) {
  const {
    children,
    options = { keepAliveInterval: 0 },
    parserMethod,
  } = props;
  
  // Using a ref rather than relying on state because it is synchronous
  const clientValid = useRef(false);
  const [connectionStatus, setStatus] = useState<ConnectionStatus>(ConnectionStatus.Offline);
  const [error, setError] = useState<Paho.MQTT.ErrorWithInvocationContext | undefined>();
  const [client, setClient] = useState<CustomClient | null>(null);

  useEffect(() => {
    if (!client && !clientValid.current) {
      // This synchronously ensures we won't enter this block again
      // before the client is asynchronously set
      clientValid.current = true;
      setStatus(ConnectionStatus.Connecting);
      const mqtt = new CustomClient(props);
      mqtt.connect(options)
      mqtt.on('connected', () => {
        console.debug('on connect');
        setStatus(ConnectionStatus.Connected);
        setError(undefined);
        // For some reason setting the client as soon as we get it from connect breaks things
        setClient(mqtt);
      });
    
      mqtt.on('error', err => {
        console.log(`Connection error:`, err);
        setStatus(ConnectionStatus.Error);
        setError(err);
      });

      mqtt.on('connectionLost', () => {
        console.debug('on end');
        setStatus(ConnectionStatus.Offline);
        setError(undefined);
      });
    }
  }, [client, clientValid, props]);

  // Only do this when the component unmounts
  useEffect(
    () => () => {
      if (client) {
        console.log('closing mqtt client');
        if (client.isConnected)
          client.disconnect()
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
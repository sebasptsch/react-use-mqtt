import React, { useEffect, useState, useMemo, useRef } from "react";

import { Client } from "paho-mqtt";

import MqttContext from "./Context";
import {
  Error,
  ConnectorProps,
  IMqttContext,
  MqttProviderProps,
} from "./types";

export default function Connector({
  children,
  brokerUrl,
  clientId,
  options = { keepAliveInterval: 0 },
  parserMethod,
}: MqttProviderProps) {
  // Using a ref rather than relying on state because it is synchronous
  const clientValid = useRef(false);
  const [connectionStatus, setStatus] = useState<string | Error>("Offline");
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!client && !clientValid.current) {
      // This synchronously ensures we won't enter this block again
      // before the client is asynchronously set
      clientValid.current = true;
      setStatus("Connecting");
      console.log(`attempting to connect to ${brokerUrl}`);
      const mqtt = new Client(brokerUrl, clientId);
      mqtt.connect({
        ...options,
        onSuccess: () => {
          console.debug("on connect");
          setStatus("Connected");
          // For some reason setting the client as soon as we get it from connect breaks things
          setClient(mqtt);
        },
        onFailure: (err) => {
          console.log(`Connection error: ${err.errorCode} ${err.errorMessage}`);
          setStatus(err.errorMessage);
        }
      });

      mqtt.onConnectionLost = (err) => {
        console.log(`Connection lost: ${err.errorCode} ${err.errorMessage}`);
        setStatus(err.errorMessage);
      };
      
    }
  }, [client, clientValid, brokerUrl, options]);

  // Only do this when the component unmounts
  useEffect(
    () => () => {
      if (client) {
        console.log("closing mqtt client");
        client.disconnect();
        setClient(null);
        clientValid.current = false;
      }
    },
    [client, clientValid]
  );

  // This is to satisfy
  // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-constructed-context-values.md
  const value: IMqttContext = useMemo<IMqttContext>(
    () => ({
      connectionStatus,
      client,
      parserMethod,
    }),
    [connectionStatus, client, parserMethod]
  );

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
}

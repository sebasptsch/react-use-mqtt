import { useContext, useEffect, useCallback, useState } from 'react';

import { OnMessageHandler, SubscribeOptions } from 'paho-mqtt';
import { matches } from 'mqtt-pattern';

import MqttContext from './Context';
import { IMqttContext as Context, IUseSubscription, IMessage } from './types';

/**
 * A hook to subscribe to a topic
 * @todo Add support for multiple subscription hooks
 * @param topic The topic/topics to subscribe to
 * @param options The options to subscribe with
 * @returns The message, client and connection status
 */
export default function useSubscription(
  topic: string | string[],
  options: SubscribeOptions = {} as SubscribeOptions,
): IUseSubscription {
  const { client, connectionStatus, parserMethod } = useContext<Context>(
    MqttContext,
  );

  const [message, setMessage] = useState<IMessage | undefined>(undefined);

  const subscribe = useCallback(async () => {
    if (Array.isArray(topic)) {
        await Promise.all(
            topic.map(t => client?.subscribe(t, options)),
        );
    } else {
        client?.subscribe(topic, options);
    }
   
  }, [client, options, topic]);

  const unsubscribe = useCallback(async () => {
    if (Array.isArray(topic)) {
        await Promise.all(
            topic.map(t => client?.unsubscribe(t)),
        );
    } else {
        client?.unsubscribe(topic);
    }
    }, [client, options, topic]);


  const callback: OnMessageHandler = useCallback(
    ({destinationName, payloadString}) => {
      if ([topic].flat().some(rTopic => matches(rTopic, destinationName))) {
        setMessage({
          topic: destinationName,
          message:
            parserMethod?.(payloadString) || payloadString.toString(),
        });
      }
    },
    [parserMethod, topic],
  );

  useEffect(() => {
    if (client?.isConnected()) {
      subscribe();

      client.onMessageArrived = callback;
    }
    return () => {
      if (client?.isConnected()) {
        unsubscribe();
        client.onMessageArrived = () => null;
      }
    };
  }, [callback, client, subscribe]);

  return {
    client,
    topic,
    message,
    connectionStatus,
  };
}
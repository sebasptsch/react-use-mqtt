import { useContext, useEffect, useCallback, useState } from 'react';

import type { IClientSubscribeOptions } from 'precompiled-mqtt';
import { matches } from 'mqtt-pattern';

import MqttContext from './Context';
import { IMqttContext as Context, IUseSubscription, IMessage, MessageArguments } from './types';

export default function useSubscription(
  topic: string | string[],
  options: IClientSubscribeOptions = {} as IClientSubscribeOptions,
): IUseSubscription {
  const { client, connectionStatus, parserMethod, error } = useContext<Context>(
    MqttContext,
  );

  const [message, setMessage] = useState<IMessage | undefined>(undefined);

  const subscribe = useCallback(async () => {
    client?.subscribe(topic, options);
  }, [client, options, topic]);

  const callback = useCallback(
    (...args: MessageArguments) => {
      if ([topic].flat().some(rTopic => matches(rTopic, args[0]))) {
        setMessage({
          topic: args[0],
          message:
            parserMethod?.(...args) || args[1].toString(),
        });
      }
    },
    [parserMethod, topic],
  );

  useEffect(() => {
    if (client?.connected) {
      subscribe();

      client.on('message', callback);
    }
    return () => {
      client?.off('message', callback);
    };
  }, [callback, client, subscribe]);

  return {
    client,
    topic,
    message,
    connectionStatus,
    error
  };
}
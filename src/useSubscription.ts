import { useContext, useEffect, useCallback, useState } from "react";

import { matches } from "mqtt-pattern";

import MqttContext from "./Context";
import { IMqttContext as Context, IUseSubscription, IMessage } from "./types";
import { Message } from "paho-mqtt";

export default function useSubscription(
  topic: string | string[]
): IUseSubscription {
  const { client, connectionStatus, parserMethod, error } =
    useContext<Context>(MqttContext);

  const [message, setMessage] = useState<IMessage | undefined>(
    undefined
  );

  const subscribe = useCallback(async () => {
    if (Array.isArray(topic)) {
      topic.forEach((t) => client?.subscribe(t));
    } else {
      client?.subscribe(topic);
    }
  }, [client, topic]);

  const callback = useCallback(
    (message: Message) => {
      console.log("callback triggered", message.destinationName, message.payloadString);
      if (
        [topic]
          .flat()
          .some((rTopic) => matches(rTopic, message.destinationName))
      ) {
        setMessage({
          topic: message.destinationName,
          message: parserMethod?.(message) || message.payloadString,
        });
      }
    },
    [parserMethod, topic]
  );

  useEffect(() => {
    if (client?.isConnected) {
      subscribe();

      client.on("messageArrived", callback);
    }
    return () => {
      client?.off("messageArrived", callback);
    };
  }, [callback, client, subscribe]);

  return {
    client,
    topic,
    message,
    connectionStatus,
    error,
  };
}

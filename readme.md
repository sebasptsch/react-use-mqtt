## React Use MQTT

[![Publish Package to npmjs](https://github.com/sebasptsch/react-use-mqtt/actions/workflows/publish.yml/badge.svg)](https://github.com/sebasptsch/react-use-mqtt/actions/workflows/publish.yml)

---

## Installation

```bash
npm install react-use-mqtt
# or
yarn add react-use-mqtt
```

## Usage

```jsx
import React from "react";

import { MqttProvider } from "react-use-mqtt";

export default function App() {
  return (
    <MqttProvider
      brokerUrl="ws://localhost:9001"
      options={{
        clientId: "react-use-mqtt",
        username: "admin",
        password: "admin",
      }}
    >
      <YourApp />
    </MqttProvider>
  );
}
```

```jsx
import React from "react";

import { useMqttState } from "react-use-mqtt";

export default function YourApp() {
  const { connectionStatus } = useMqttState();

  return <div>{connectionStatus}</div>;
}
```

```jsx
import React from "react";

import { useSubscription } from "react-use-mqtt";

export default function YourApp() {
  const { client, topic, message, connectionStatus, error } = useSubscription("topic");
    

  return <div>{message.message}</div>;
}
```

## Building

```bash
yarn build
```

## License

MIT © [sebasptsch](https://github.com/sebasptsch)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.



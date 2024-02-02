import { HostPortOrURI } from "./types";

export const options = {
  clientId: `testing-mqtt-react-hooks`,
  uri: `ws://test.mosquitto.org:8080/`,
} satisfies HostPortOrURI

export const connectionTimeout = 10_000;
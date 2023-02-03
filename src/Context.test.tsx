/**
 * @jest-environment jsdom
 */

import React from 'react';

import { renderHook, act, waitFor } from '@testing-library/react';

import { useMqttState, MqttProvider, ConnectionStatus } from './';
import { HOST, options, PORT } from './connection';

let wrapper: React.FC<{children: React.ReactNode}>;

describe('Connector wrapper', () => {
  beforeAll(() => {
    wrapper = ({ children }: {children: React.ReactNode}) => (
      <MqttProvider host={HOST} port={PORT} clientId="testing-mqtt-react-hooks">
        {children}
      </MqttProvider>
    );
  });

  it('should not connect with mqtt, wrong url', async () => {
    const { result } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <MqttProvider
          host={"test.mosqu.org"} port={PORT} clientId="testing-mqtt-react-hooks"
          options={{ timeout: 2 }}
        >
          {children}
        </MqttProvider>
      ),
    });

    await waitFor(() => expect(result.current.connectionStatus).toBe(ConnectionStatus.Error));
  });

  it('should connect with mqtt', async () => {
    const { result } = renderHook(() => useMqttState(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.client?.isConnected).toBe(true));

    expect(result.current.connectionStatus).toBe(ConnectionStatus.Connected);

    await act(async () => {
      result.current.client?.disconnect();
    });
  });

  it('should connect passing props', async () => {
    const { result } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <MqttProvider
        host={HOST} port={PORT} clientId="testing-mqtt-react-hooks"
        >
          {children}
        </MqttProvider>
      ),
    });

    await waitFor(() => expect(result.current.client?.isConnected).toBe(true));

    expect(result.current.connectionStatus).toBe(ConnectionStatus.Connected);

    await act(async () => {
      result.current.client?.disconnect();
    });
  });
});
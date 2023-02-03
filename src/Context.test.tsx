/**
 * @jest-environment jsdom
 */

import React from 'react';

import { renderHook, act, waitFor } from '@testing-library/react';

import { useMqttState, MqttProvider, ConnectionStatus } from './';
import { URL, options } from './connection';

let wrapper: React.FC<{children: React.ReactNode}>;

describe('Connector wrapper', () => {
  beforeAll(() => {
    wrapper = ({ children }: {children: React.ReactNode}) => (
      <MqttProvider brokerUrl={URL} options={options}>
        {children}
      </MqttProvider>
    );
  });

  it('should not connect with mqtt, wrong url', async () => {
    const { result } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <MqttProvider
          brokerUrl="mqtt://test.mosqu.org:1884"
          options={{ connectTimeout: 2000 }}
        >
          {children}
        </MqttProvider>
      ),
    });

    await waitFor(() => expect(result.current.connectionStatus).toBe(ConnectionStatus.Offline));
  });

  it('should connect with mqtt', async () => {
    const { result } = renderHook(() => useMqttState(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.client?.connected).toBe(true));

    expect(result.current.connectionStatus).toBe('Connected');

    await act(async () => {
      result.current.client?.end();
    });
  });

  it('should connect passing props', async () => {
    const { result } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <MqttProvider
          brokerUrl={URL}
          options={{ clientId: 'testingMqttUsingProps' }}
        >
          {children}
        </MqttProvider>
      ),
    });

    await waitFor(() => expect(result.current.client?.connected).toBe(true));

    expect(result.current.connectionStatus).toBe(ConnectionStatus.Connected);

    await act(async () => {
      result.current.client?.end();
    });
  });
});
/**
 * @jest-environment jsdom
 */

import React from 'react';

import { renderHook, act, waitFor } from '@testing-library/react';

import { useMqttState, MqttProvider, ConnectionStatus } from './';
import { connectionTimeout, options } from './connection';

let wrapper: React.FC<{children: React.ReactNode}>;

describe('Connector wrapper', () => {
  beforeAll(() => {
    wrapper = ({ children }: {children: React.ReactNode}) => (
      <MqttProvider {...options}>
        {children}
      </MqttProvider>
    );
  });

  it('should not connect with mqtt, wrong url', async () => {
    const { result } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <MqttProvider
          clientId={options.clientId}
          uri='ws://test.mos.org:8080/' // wrong url
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

    await waitFor(() => expect(result.current.client?.isConnected).toBe(true), {
      timeout: connectionTimeout,
    });

    expect(result.current.connectionStatus).toBe(ConnectionStatus.Connected);

    await act(async () => {
      result.current.client?.disconnect();
    });
  });

  it('should connect passing props', async () => {
    const { result } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <MqttProvider
        {...options}
        >
          {children}
        </MqttProvider>
      ),
    });

    await waitFor(() => expect(result.current.client?.isConnected).toBe(true), {
      timeout: connectionTimeout,
    });

    expect(result.current.connectionStatus).toBe(ConnectionStatus.Connected);

    await act(async () => {
      result.current.client?.disconnect();
    });
  });
});
/**
 * @jest-environment jsdom
 */

import React from 'react';

import { cleanup, renderHook, waitFor } from '@testing-library/react';

import { MqttProvider, useSubscription } from '.';
import { connectionTimeout, options } from './connection';

const TOPIC = 'mqtt/react/hooks/test';

let wrapper: React.FC<{children: React.ReactNode}>;

describe('useSubscription', () => {
  beforeAll(async () => {
    wrapper = ({ children }) => (
      <MqttProvider {...options}>
        {children}
      </MqttProvider>
    );
  });

  afterEach(cleanup)

  it('should get message on topic test', async () => {
    const { result } = renderHook(
      () => useSubscription(TOPIC),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.client?.isConnected).toBe(true), {
      timeout: connectionTimeout,
    });

    const message = 'testing message';

    result.current.client?.publish(TOPIC, message);

    await waitFor(() => expect(result.current?.message?.message).toBe(message), {
      timeout: connectionTimeout,
    });
  });

  it('should get message on topic with single selection of the path + ', async () => {
    const { result } = renderHook(
      () => useSubscription(`${TOPIC}/+/test/+/selection`),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.client?.isConnected).toBe(true), {
      timeout: connectionTimeout,
    });

    const message = 'testing single selection message';

    result.current.client?.publish(
      `${TOPIC}/match/test/single/selection`,
      message,
    );

    await waitFor(() => expect(result.current.message?.message).toBe(message));
  });

  it('should get message on topic with # wildcard', async () => {
    const { result } = renderHook(
      () => useSubscription(`${TOPIC}/#`),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.client?.isConnected).toBe(true), {
      timeout: connectionTimeout,
    });

    const message = 'testing with # wildcard';

    result.current.client?.publish(`${TOPIC}/match/test/wildcard`, message);

    await waitFor(() => expect(result.current.message?.message).toBe(message), {
      timeout: connectionTimeout,
    });
  });
});
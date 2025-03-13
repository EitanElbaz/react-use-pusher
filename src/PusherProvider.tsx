import Pusher from 'pusher-js';
import type { Options } from 'pusher-js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import equal from 'fast-deep-equal';
import { PusherProviderProps } from './types';
import { ChannelsProvider } from './ChannelsProvider';
import { PusherContext } from './PusherContext';

export const PusherProvider: React.FC<PusherProviderProps> = ({
  options,
  additionalUserInfo,
  clientKey,
  cluster,
  channelAuthEndpoint,
  ready = true,
  children,
}) => {
  const pusherOptions = useMemo<Options>(
    () => ({
      enabledTransports: ['wss', 'ws'],
      forceTLS: true,
      cluster,
      channelAuthorization: {
        endpoint: channelAuthEndpoint ?? '',
        transport: 'ajax',
        params: {
          ...(additionalUserInfo ?? {}),
        },
      },
      ...options,
    }),
    [cluster, channelAuthEndpoint, additionalUserInfo, options],
  );

  const prevConfig = useRef<Options>(null);
  const [client, setClient] = useState<Pusher>();

  useEffect(
    function createPusherClient() {
      if (ready && !equal(prevConfig.current, pusherOptions) && window != null) {
        // disconnect from old client before reconnecting with new one
        if (client) client.disconnect();

        prevConfig.current = pusherOptions;

        setClient(new Pusher(clientKey, pusherOptions));
      }
    },
    [client, clientKey, pusherOptions, ready],
  );

  return (
    <PusherContext.Provider
      value={useMemo(
        () => ({
          client,
        }),
        [client],
      )}
    >
      <ChannelsProvider>{children}</ChannelsProvider>
    </PusherContext.Provider>
  );
};

import type Pusher from 'pusher-js';
import type { Options } from 'pusher-js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import equal from 'fast-deep-equal';
import { PusherProviderProps } from './types';
import { ChannelsProvider } from './ChannelsProvider';
import { PusherContext } from './PusherContext';

export const PusherProvider: React.FC<PusherProviderProps> = ({
  options,
  additionalChannelAuthParams,
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
          ...(additionalChannelAuthParams ?? {}),
        },
      },
      ...options,
    }),
    [cluster, channelAuthEndpoint, additionalChannelAuthParams, options],
  );

  const prevConfig = useRef<Options>(null);
  const [client, setClient] = useState<Pusher>();

  useEffect(
    function createPusherClient() {
      if (ready && !equal(prevConfig.current, pusherOptions) && window != null) {
        // disconnect from old client before reconnecting with new one
        if (client) client.disconnect();

        prevConfig.current = pusherOptions;

        import('pusher-js')
          .then(Pusher => {
            try {
              setClient(new Pusher.default(clientKey, pusherOptions));
            } catch {
              console.error('failed to initialise Pusher!');
            }
          })
          .catch(() => {
            console.error('failed to load Pusher!');
          });
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

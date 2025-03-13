import type { Channel } from 'pusher-js';
import { useEffect, useState } from 'react';
import { useChannelsContext } from './useChannelsContext';

export function useChannel<T extends Channel = Channel>(channelName: string | undefined) {
  const [channel, setChannel] = useState<T>();
  const { subscribe, unsubscribe } = useChannelsContext();

  useEffect(
    function subscribeToChannel() {
      if (channelName && subscribe && unsubscribe) {
        setChannel(subscribe<T>(channelName));
      }

      return () => {
        if (unsubscribe && channelName) unsubscribe(channelName);
      };
    },
    [channelName, subscribe, unsubscribe],
  );

  return channel;
}

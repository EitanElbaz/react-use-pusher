import type { Channel, PresenceChannel } from 'pusher-js';
import invariant from 'invariant';
import { useCallback } from 'react';

export function useClientTrigger<TData = Record<string, unknown>>(
  channel: Channel | PresenceChannel | undefined,
) {
  return useCallback(
    (eventName: string, data: TData) => {
      invariant(eventName, 'Must pass event name to trigger a client event.');
      invariant(
        channel?.name.match(/(private-|presence-)/gi),
        "Channel provided to useClientTrigger wasn't private or presence channel. Client events only work on these types of channels.",
      );

      if (channel) channel.trigger(eventName, data);
    },
    [channel],
  );
}

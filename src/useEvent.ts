import type { Channel } from 'pusher-js';
import invariant from 'invariant';
import { useEffect } from 'react';

export function useEvent<D>(
  channel: Channel | undefined,
  eventName: string,
  callback: (data?: D, metadata?: { user_id: string }) => void,
) {
  // error when required arguments aren't passed.
  invariant(eventName, 'Must supply eventName and callback to onEvent');
  invariant(callback, 'Must supply callback to onEvent');

  // bind and unbind events whenever the channel, eventName or callback changes.
  useEffect(
    function bindEvents() {
      channel?.bind(eventName, callback);
      return () => {
        channel?.unbind(eventName, callback);
      };
    },
    [channel, eventName, callback],
  );
}

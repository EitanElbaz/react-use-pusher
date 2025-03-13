import invariant from 'invariant';
import type { Channel } from 'pusher-js';
import { useChannel } from './useChannel';

export function usePrivateChannel<T extends Channel = Channel>(
  channelName: `private-${string}` | undefined,
) {
  if (channelName) {
    invariant(
      channelName.includes('private-'),
      "Private channels should use prefix 'private-' in their name. Use the useChannel hook instead.",
    );
  }

  return useChannel<T>(channelName);
}

import invariant from 'invariant';
import type PrivateChannel from 'pusher-js/types/src/core/channels/private_channel';
import { useChannel } from './useChannel';

export function usePrivateChannel<T extends PrivateChannel = PrivateChannel>(
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

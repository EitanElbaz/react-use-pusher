// https://pusher.com/docs/channels/using_channels/events/#channel-events
// https://pusher.com/docs/channels/using_channels/presence-channels/#events
export const pusherChannelEvents = {
  presenceMemberAdded: 'pusher:member_added',
  presenceMemberRemoved: 'pusher:member_removed',

  presenceSubscriptionSucceeded: 'pusher:subscription_succeeded',
  presenceSubscriptionError: 'pusher:subscription_error',
  presenceSubscriptionCount: 'pusher:subscription_count',
};

import type Pusher from 'pusher-js';
import { Channel, Options } from 'pusher-js';
import React from 'react';

export interface PusherContextValues {
  client?: Pusher;
}

export interface ChannelsContextValues {
  subscribe?: <T extends Channel = Channel>(channelName: string) => T | undefined;
  unsubscribe?: (channelName: string) => void;
  getChannel?: <T extends Channel = Channel>(channelName: string) => T | undefined;
}

export interface PusherProviderProps {
  children: React.ReactNode;
  options?: Partial<Options>;

  clientKey: string;
  cluster: string;

  additionalUserInfo?: Record<string, unknown>;

  channelAuthEndpoint?: string;

  /**
   * Default: true
   *
   * Set to false if you don't, for example, have the user data ready yet.
   *
   * As long as it is set to false, a connection will not be initialised.
   */
  ready?: boolean;
}

export type WebsocketsMemberUserInfo = {
  id: string;
  name: string;
};

export type WebsocketsChannelSubscriptionSuccess<
  T extends WebsocketsMemberUserInfo = WebsocketsMemberUserInfo,
> = {
  count: number;
  myID: string;
  me: PusherMemberJoinedData<T>;
  members: WebsocketsPresenceChannelMembers<T>;
};

export type WebsocketsPresenceChannelMembers<
  T extends WebsocketsMemberUserInfo = WebsocketsMemberUserInfo,
> = Record<string, T>;

export type PusherMemberJoinedData<T extends WebsocketsMemberUserInfo = WebsocketsMemberUserInfo> =
  {
    id: string;
    info: T;
  };

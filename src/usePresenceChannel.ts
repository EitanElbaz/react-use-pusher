import type { PresenceChannel } from 'pusher-js';
import { useCallback, useEffect, useMemo } from 'react';
import invariant from 'invariant';
import { atomWithReducer } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useChannel } from './useChannel';
import {
  PusherMemberJoinedData,
  WebsocketsChannelSubscriptionSuccess,
  WebsocketsMemberUserInfo,
} from './types';
import { pusherChannelEvents } from './constants';

type ChannelMembersInfo<T extends WebsocketsMemberUserInfo = WebsocketsMemberUserInfo> = {
  members: T[];
  me: T;
};
type MembersReducerState<T extends WebsocketsMemberUserInfo = WebsocketsMemberUserInfo> = {
  // key is the channel name
  channelMembers: Record<string, ChannelMembersInfo<T>>;
  myId?: string;
  me?: T;
};

type MembersReducerAction<T extends WebsocketsMemberUserInfo = WebsocketsMemberUserInfo> =
  | {
      type: 'subscriptionSuccess';
      payload: {
        channelName: string;
        members: WebsocketsChannelSubscriptionSuccess<T>;
      };
    }
  | {
      type: 'addMember';
      payload: { channelName: string; member: PusherMemberJoinedData<T> };
    }
  | {
      type: 'removeMember';
      payload: { channelName: string; member: PusherMemberJoinedData<T> };
    };

function membersReducer<T extends WebsocketsMemberUserInfo>(
  state: MembersReducerState<T>,
  action: MembersReducerAction<T>,
) {
  switch (action.type) {
    case 'subscriptionSuccess': {
      return {
        ...state,
        channelMembers: {
          ...state.channelMembers,
          [action.payload.channelName]: {
            me: action.payload.members.me.info,
            members: Object.entries(action.payload.members.members).reduce<T[]>(
              (members, [memberId, member]) => [
                ...members,
                { id: memberId, ...(member as object) } as T,
              ],
              [],
            ),
          } as ChannelMembersInfo,
        },
      };
    }
    case 'addMember': {
      const newChannelData = {
        ...(state.channelMembers?.[action.payload.channelName] ?? {
          members: [],
          me: null,
        }),
      };
      if (newChannelData.members.find(mem => mem.id === action.payload.member.id) == null)
        newChannelData.members = [
          ...newChannelData.members,
          { ...action.payload.member.info, id: action.payload.member.id },
        ];

      return {
        ...state,
        channelMembers: {
          ...state.channelMembers,
          [action.payload.channelName]: {
            ...newChannelData,
          } satisfies ChannelMembersInfo<T>,
        },
      };
    }
    case 'removeMember': {
      const newChannelData = {
        ...(state.channelMembers?.[action.payload.channelName] ?? {
          members: [],
          me: null,
        }),
      };
      newChannelData.members = newChannelData.members.filter(
        mem => mem.id !== action.payload.member.id,
      );

      return {
        ...state,
        channelMembers: {
          ...state.channelMembers,
          [action.payload.channelName]: {
            ...newChannelData,
          } as ChannelMembersInfo,
        },
      };
    }
    default:
      return state;
  }
}

const reducerAtom = atomWithReducer<
  MembersReducerState<WebsocketsMemberUserInfo>,
  MembersReducerAction<WebsocketsMemberUserInfo>
>({ channelMembers: {} }, membersReducer);

export function usePresenceChannel<T extends WebsocketsMemberUserInfo = WebsocketsMemberUserInfo>(
  channelName: `presence-${string}`,
) {
  if (channelName) {
    invariant(
      channelName.includes('presence-'),
      "Presence channels should use prefix 'presence-' in their name. Use the useChannel hook instead.",
    );
  }

  /** Store internal channel state */
  const [state, dispatch] = useAtom(reducerAtom);

  const currentChannelData = useMemo<ChannelMembersInfo>(
    () => state?.channelMembers?.[channelName] ?? { members: [], me: null },
    [state, channelName],
  );

  const onSubscriptionSuccess = useCallback(
    (members: WebsocketsChannelSubscriptionSuccess) => {
      dispatch({
        type: 'subscriptionSuccess',
        payload: { channelName, members },
      });
    },
    [channelName, dispatch],
  );

  const onMemberJoined = useCallback(
    (member: PusherMemberJoinedData) => {
      dispatch({ type: 'addMember', payload: { channelName, member } });
    },
    [channelName, dispatch],
  );

  const onMemberRemoved = useCallback(
    (member: PusherMemberJoinedData) => {
      dispatch({ type: 'removeMember', payload: { channelName, member } });
    },
    [channelName, dispatch],
  );

  // bind and unbind member events on our channel
  const channel = useChannel<PresenceChannel>(channelName);

  useEffect(
    function subscribeToEvents() {
      channel?.bind(pusherChannelEvents.presenceSubscriptionSucceeded, onSubscriptionSuccess);
      channel?.bind(pusherChannelEvents.presenceMemberAdded, onMemberJoined);
      channel?.bind(pusherChannelEvents.presenceMemberRemoved, onMemberRemoved);
      return () => {
        channel?.unbind(pusherChannelEvents.presenceSubscriptionSucceeded, onSubscriptionSuccess);
        channel?.unbind(pusherChannelEvents.presenceMemberAdded, onMemberJoined);
        channel?.unbind(pusherChannelEvents.presenceMemberRemoved, onMemberRemoved);
      };
    },
    [channel, onMemberRemoved, onMemberJoined, onSubscriptionSuccess],
  );

  return useMemo(
    () => ({
      channel,
      members: currentChannelData.members as T[],
      count: currentChannelData.members.length,
      me: currentChannelData.me as T | null,
      myID: currentChannelData?.me?.id,
    }),
    [currentChannelData, channel],
  );
}

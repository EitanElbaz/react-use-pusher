# `react-use-pusher`

> Easy as [React hooks](https://reactjs.org/docs/hooks-intro.html) that integrate with the [`pusher-js`](https://github.com/pusher/pusher-js) library.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [Usage](#usage)
- [`useChannel`](#usechannel)
- [`usePresenceChannel`](#usepresencechannel)
- [`useEvent`](#useevent)
- [`useClientTrigger`](#useclienttrigger)
- [`usePusher`](#usepusher)
- [`NextJS`](#nextjs)
  - [`NextJS Authentication`](#nextjs-authentication-endpoint-example)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

`npm install react-use-pusher`

## Usage

You must wrap your app with a `PusherProvider` and pass it config props for [`pusher-js`](https://github.com/pusher/pusher-js) initialisation.

```tsx
import React from 'react';
import { PusherProvider } from 'react-use-pusher';

const App = () => {
  <PusherProvider
    clientKey={process.env.CLIENT_KEY}
    cluser="eu"
    // you can set this to false if you're waiting on some state to load
    ready
    // if you're using presence channels
    // see: https://pusher.com/docs/channels/server_api/authorizing-users/#implementing-the-authorization-endpoint-for-a-presence-channel 
    channelAuthEndpoint="/api/auth"
    // TIP: if you're hosting your own websocket server via something like Soketi
    // you can pass additional pusher options for the websocket connection via the prop bellow
    // recommend you either memoise these options or
    // use a statically defined object outside the component if possible
      
    // options={{ wsHost: 'MY_HOST', wssPort: 1234, wsPort:1233, wsPath: '/my-path' }}
  >
    <Example />
  </PusherProvider>;
};
```

## `useChannel`

Use this hook to subscribe to a channel.

```tsx
// returns channel instance.
const channel = useChannel('channel-name');
```

## `usePresenceChannel`

Presence channels allow you to see who else is connected

If you're using presence channels, you must provide an auth endpoint.

See the [Pusher Docs](https://pusher.com/docs/channels/server_api/authorizing-users/#implementing-the-authorization-endpoint-for-a-presence-channel) for examples for how the endpoint is implemented.

```tsx
const Example = () => {
  const { members, myID } = usePresenceChannel('presence-dashboard');

  return (
    <ul>
      {members
        // filter self from members
        .filter(({ id }) => id !== myID)
        // map them to a list
        .map(({ id, name }) => (
          <li key={id}>{name}</li>
        ))}
    </ul>
  );
};
```

## `useEvent`

Bind to events on a channel with a callback.

```tsx
const Example = () => {
  const [message, setMessages] = useState();
  const channel = useChannel('channel-name');
  useEvent(channel, 'event name', (data) => console.log(data));
};
```

_Note_: This will bind and unbind to the event on each render. You may want to memoise your callback with `useCallback` before passing it in.

## `useClientTrigger`

Message other clients directly. use [client events](https://pusher.com/docs/channels/using_channels/events#triggering-client-events) to push directly from the client:

```tsx
import { useChannel, useClientTrigger } from 'react-use-pusher';

const Example = () => {
  const channel = useChannel('presence-dashboard');
  const trigger = useClientTrigger(channel);
  const handleClientEvent = () => {
    trigger('event name', eventData);
  };

  return <button onClick={handleClientEvent}>Fire</button>;
};
```


## `usePusher`

Get access to the Pusher instance to do other things.

```tsx
import { usePusher } from 'react-use-pusher';

const Example = () => {
  const { client } = usePusher();

  return null;
};
```

## NextJS

You cannot import `react-use-pusher` in a file which will be included in the server build.

You can use dynamic imports in the pages router to avoid files being included in server builds.

```tsx
// your page.tsx file

import dynamic from 'next/dynamic';

const MyPageComponent = dynamic(() => import('../components/MyPageComponent'), {
    ssr: false,
});

export default function Home() {
  return (
    <MyPageComponent />
  );
}

```

```tsx
// MyPageComponent.tsx

const MyPageComponent: FC<PropsWithChildren> = ({ children }) => {
  return (
    <PusherProvider
      cluster="eu"
      clientKey="some_key"
      ready
      channelAuthEndpoint="/api/auth"
    >
      // components
      // you can use all the hooks in components which go here    
    </PusherProvider>
  );
};

export default MyPageComponent;
```

### NextJS Authentication endpoint example

```bash
  npm install pusher
```

```ts
// pages/api/auth.ts

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';

type Modify<T, K extends keyof T, U> = Omit<T, K> & {
    [P in keyof Pick<T, K>]: U;
};

type AuthBody = {
    socket_id: string;
    channel_name: string;
    [key: string]: unknown;
};

const pusher = new Pusher({
    appId: process.env.APP_ID,
    key: process.env.APP_KEY,
    secret: process.env.APP_SECRET,
    cluster: 'eu',
});

export default function handler(
    req: Modify<NextApiRequest, 'body', AuthBody>,
    res: NextApiResponse,
) {
    const { socket_id, channel_name, ...rest } = req.body;

    const channelData = {
        // user_id is mandatory according to pusher docs
        user_id: 'the user id',
        user_info: {
            // name within user_info is mandatory
            name: 'the authenticated user name',
            // you can put whatever you like here. It'll appear in the presence channel member's data
            ...rest,
        },
    };
    res.status(200).json(pusher.authorizeChannel(socket_id, channel_name, channelData));
}

```

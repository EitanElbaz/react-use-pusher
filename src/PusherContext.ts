import { createContext } from 'react';
import { PusherContextValues } from './types';

export const PusherContext = createContext<PusherContextValues>({});

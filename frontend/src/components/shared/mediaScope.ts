import { createContext } from 'react';
export const MediaScope = createContext<{ userId: string; projectId: string } | null>(null);

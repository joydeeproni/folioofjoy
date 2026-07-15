'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { WorkItem, WritingNav } from '@/lib/sanity/queries';

// Holds the Sanity-sourced Work + Writings so the many client components
// (marquee, carousel, photo pile, writings preview) can read them without
// threading props through the whole tree. Fed once by the root layout.
interface ContentValue {
  work: WorkItem[];
  writings: WritingNav[];
}

const ContentContext = createContext<ContentValue>({ work: [], writings: [] });

export function ContentProvider({
  work,
  writings,
  children,
}: ContentValue & { children: ReactNode }) {
  return <ContentContext.Provider value={{ work, writings }}>{children}</ContentContext.Provider>;
}

export function useWork(): WorkItem[] {
  return useContext(ContentContext).work;
}

export function useWritings(): WritingNav[] {
  return useContext(ContentContext).writings;
}

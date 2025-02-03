import { createContext } from 'react'
// TODO:AG:20240607 - add callback for updating/stopping e3 counter
export const MgaAnalyticsContext = createContext<{ id: string; name?: string }>(
  {
    id: '',
  },
)

import { createContext } from 'react'

export type CsfThemeContextType = 'light' | 'dark' | 'system'
export const CsfThemeContext = createContext<CsfThemeContextType>('system')

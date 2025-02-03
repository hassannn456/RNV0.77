import { decode } from 'base-64';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, store } from '../../store';
import { jwtApi } from './jwtApi';
import { trackError } from '../../components/useTracking';

const tokenExpirationToleranceMins = 60;

/** Token data */
export interface Token {
  accessToken: string
  refreshToken: string
}

const initialState: Token = {
  accessToken: '',
  refreshToken: '',
};

const jwtSlice = createSlice({
  name: 'jwt',
  initialState,
  reducers: {
    setToken: (_state, action: PayloadAction<Token>) => {
      return { ...action.payload };
    },
  },
});

export const getAccessToken: (
  state: RootState,
) => string | undefined = state => {
  return state.jwt?.accessToken;
};

export const getRefreshToken: (
  state: RootState,
) => string | undefined = state => {
  return state.jwt?.refreshToken;
};

export type JwtPayload = {
  exp: number
  env: 'qa' | 'prod'
  mysAccountId?: number
}

/**
 * Test a JWT for usability with microservices
 * (expiration, correct account, etc...)
 */
export const isTokenUseable = (token: string, state: RootState): boolean => {
  // Can token be parsed?
  let payload: JwtPayload;
  try {
    if (!token) {
      return false;
    }
    const jwtFragment: string = token.split('.')?.[1];
    if (!jwtFragment) {
      throw new Error('Invalid JWT token');
    }
    const jsonString: string = decode(jwtFragment);
    payload = JSON.parse(jsonString) as JwtPayload;
  } catch (error) {
    trackError('jwtSlice.ts::isTokenUseable')(error);
    return false;
  }
  // Is token expired?
  const now: number = Date.now() / 1000; // Get the current Unix timestamp in seconds
  const exp = payload.exp - tokenExpirationToleranceMins * 60;
  if (exp < now) {
    return false;
  }
  // Do environments match?
  const tokenEnv = payload.env;
  const stateEnv = state.preferences?.environment;
  if (!tokenEnv || !stateEnv?.includes(`cloud${tokenEnv}`)) {
    return false;
  }
  // Do accounts match?
  const tokenAcc = payload.mysAccountId;
  const stateAcc = state.session?.account.accountKey;
  if (tokenAcc != stateAcc) {
    return false;
  }
  // All checks clear
  return true;
};
export const getTokenFromService: () => Promise<Token | null> = async () => {
  const response = await store
    .dispatch(jwtApi.endpoints.generateToken.initiate(undefined))
    .unwrap()
    .catch(console.error);

  if (response?.success) {
    store.dispatch({ type: 'jwt/setToken', payload: response.data });
    return response.data;
  } else {
    trackError('jwtSlice.ts::getTokenFromService')(response);
    return null;
  }
};

export const getTokenFromStateOrService: (
  state: RootState,
) => Promise<Token | null> = async state => {
  const validStateToken = (() => {
    if (!state.jwt) return null;
    if (!state.jwt.accessToken) return null;
    if (!isTokenUseable(state.jwt.accessToken, state)) return null;
    return state.jwt;
  })();
  if (validStateToken) {
    return validStateToken;
  } else {
    const generatedToken = await getTokenFromService();
    return generatedToken;
  }
};

export const { setToken } = jwtSlice.actions;
export default jwtSlice.reducer;

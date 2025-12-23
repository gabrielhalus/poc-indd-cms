import { createContext, useContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';
import { initialRootState, rootReducer, type RootAction, type RootState } from './rootStore';

interface StoreContextValue {
  state: RootState;
  dispatch: Dispatch<RootAction>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, initialRootState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}



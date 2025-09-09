import { useContext, useEffect, useState, useCallback } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

type BlockerState = 'unblocked' | 'blocked' | 'proceeding';

interface Blocker {
  state: BlockerState;
  reset: () => void;
  proceed: () => void;
}

export function useBlocker(when: boolean = false): Blocker {
  const { navigator } = useContext(UNSAFE_NavigationContext) as any;
  const [state, setState] = useState<BlockerState>('unblocked');
  const [tx, setTx] = useState<any>(null);

  useEffect(() => {
    if (!when) return;
    if (typeof navigator.block !== 'function') return;

    const unblock = navigator.block((transition: any) => {
      const autoUnblockingTx = {
        ...transition,
        retry() {
          unblock();
          transition.retry();
        },
      };
      setState('blocked');
      setTx(autoUnblockingTx);
    });

    return () => {
      unblock();
      setState('unblocked');
      setTx(null);
    };
  }, [navigator, when]);

  const reset = useCallback(() => {
    setState('unblocked');
    setTx(null);
  }, []);

  const proceed = useCallback(() => {
    if (tx) {
      setState('proceeding');
      tx.retry();
    }
  }, [tx]);

  return { state, reset, proceed };
}
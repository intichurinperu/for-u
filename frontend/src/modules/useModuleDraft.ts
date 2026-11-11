import { createContext, useContext, useEffect } from 'react';

export const ModuleDraftContext = createContext<(pending: boolean) => void>(() => {});

/** Let the workspace protect edits that have not yet been applied to its document. */
export function useModuleDraft(pending: boolean) {
  const report = useContext(ModuleDraftContext);
  useEffect(() => { report(pending); return () => report(false); }, [pending, report]);
}

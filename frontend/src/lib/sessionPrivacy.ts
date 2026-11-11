// Only FOR U data is removed. Supabase manages its own authentication token lifecycle.
export function clearPrivateStorage(
  storage: Pick<Storage, "length" | "key" | "removeItem">,
) {
  const keys = Array.from({ length: storage.length }, (_, index) =>
    storage.key(index),
  );
  for (const key of keys)
    if (key && /^foru[-:]/i.test(key)) storage.removeItem(key);
}
export function clearSessionCaches() {
  try {
    clearPrivateStorage(localStorage);
  } catch {
    /* Storage may be disabled. */
  }
  try {
    clearPrivateStorage(sessionStorage);
  } catch {
    /* Storage may be disabled. */
  }
}

export function clearSignedOutStorage() {
  try {
    localStorage.clear();
  } catch {
    /* Storage may be disabled. */
  }
  try {
    sessionStorage.clear();
  } catch {
    /* Storage may be disabled. */
  }
}

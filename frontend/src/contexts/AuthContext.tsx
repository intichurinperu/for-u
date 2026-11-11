import { clearSignedOutStorage } from "../lib/sessionPrivacy";
import { useActiveProjectsStore } from "../stores/useActiveProjectsStore";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
    whatsappNumber?: string,
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase no esta configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.",
    );
  }

  return supabase;
}

function normalizeWhatsappNumber(value?: string) {
  const cleanValue = value?.trim().replace(/[^\d+]/g, "") ?? "";
  if (!cleanValue) return null;
  return cleanValue.startsWith("+") ? cleanValue : `+${cleanValue}`;
}

async function ensureProfile(
  user: User,
  displayName?: string,
  whatsappNumber?: string,
) {
  const client = requireSupabase();
  const normalizedWhatsapp = normalizeWhatsappNumber(whatsappNumber);
  const display_name =
    displayName ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Mi cuenta";
  const payload = {
    id: user.id,
    email: user.email ?? "",
    display_name,
    ...(normalizedWhatsapp
      ? { whatsapp_number: normalizedWhatsapp, whatsapp_enabled: true }
      : {}),
  };
  const { error } = await client.from("profiles").upsert(payload);
  if (error?.message.includes("display_name")) {
    const { error: fallbackError } = await client.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      ...(normalizedWhatsapp
        ? { whatsapp_number: normalizedWhatsapp, whatsapp_enabled: true }
        : {}),
    });
    if (!fallbackError) return;
    console.warn("No se pudo sincronizar el perfil todavia:", fallbackError.message);
    return;
  }

  if (error) {
    console.warn("No se pudo sincronizar el perfil todavia:", error.message);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined;
    }

    const client = requireSupabase();
    let settled = false;
    let active = true;
    let authRevision = 0;
    const applySession = (next: Session | null) => {
      const store = useActiveProjectsStore.getState();
      if (!next || store.cloudUserId !== next.user.id) store.clearCloudUser();
      setSession(next);
      setLoading(false);
    };
    const requestRevision = authRevision;

    const timeoutId = window.setTimeout(() => {
      if (!settled) {
        setLoading(false);
      }
    }, 2000);

    client.auth.getSession().then(({ data, error }) => {
      if (!active || requestRevision !== authRevision) return;
      settled = true;
      window.clearTimeout(timeoutId);

      if (error) {
        console.warn("No se pudo recuperar la sesion:", error.message);
      }

      applySession(data.session ?? null);
    });

    const { data: authListener } = client.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!active) return;
        authRevision++;
        applySession(nextSession);
        if (_event === "SIGNED_OUT") clearSignedOutStorage();
        if (nextSession?.user) {
          // Defer calls outside the auth callback to avoid locking its session refresh.
          window.setTimeout(() => {
            if (active) void ensureProfile(nextSession.user);
          }, 0);
        }
      },
    );

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signUp: async (email, password, displayName, whatsappNumber) => {
        const client = requireSupabase();
        const cleanEmail = email.trim().toLowerCase();
        const normalizedWhatsapp = normalizeWhatsappNumber(whatsappNumber);
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password: password.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              business_type: "restaurant",
              display_name: displayName?.trim(),
              whatsapp_number: normalizedWhatsapp,
            },
          },
        });

        if (error) throw error;
        if (data.user && data.session) {
          await ensureProfile(
            data.user,
            displayName?.trim(),
            normalizedWhatsapp ?? undefined,
          );
        }

        return { needsEmailConfirmation: Boolean(data.user && !data.session) };
      },
      signIn: async (email, password) => {
        const client = requireSupabase();
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        });

        if (error) throw error;
        if (data.user && data.session) {
          await ensureProfile(data.user);
        }
      },
      signOut: async () => {
        const client = requireSupabase();
        const { error } = await client.auth.signOut();
        if (error) throw error;
        useActiveProjectsStore.getState().clearCloudUser();
        setSession(null);
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// This hook shares the single authentication context above.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}

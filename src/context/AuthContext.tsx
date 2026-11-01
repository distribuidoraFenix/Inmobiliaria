import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface UserProfile {
  id: string;
  rol: string;
  nombres: string;
  apellido_paterno: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  rol: string | null;
  signIn: (
    email: string,
    pass: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const rol = profile?.rol || null;

  useEffect(() => {
    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error al obtener el perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        // Diccionario para traducir los errores comunes de Supabase Auth
        const errorTranslations: Record<string, string> = {
          "Invalid login credentials":
            "El correo electrónico o la contraseña son incorrectos.",
          "Email not confirmed":
            "Por favor, confirma tu correo electrónico antes de iniciar sesión.",
          "User not found":
            "No existe ningún usuario registrado con este correo.",
          "Invalid email or password":
            "El correo electrónico o la contraseña son incorrectos.",
        };

        // Si el error existe en el diccionario, lo traduce; si no, muestra uno genérico amigable
        const translatedMessage =
          errorTranslations[error.message] ||
          "Ocurrió un error al intentar iniciar sesión. Por favor, intenta de nuevo.";

        return { success: false, error: translatedMessage };
      }
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: "Error de conexión o problema desconocido.",
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, rol, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

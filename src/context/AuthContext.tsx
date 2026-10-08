import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  rol: "user" | "admin" | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  rol: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [rol, setRol] = useState<"user" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener la sesión activa inicial
    const obtenerSesionInicial = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Consultar el rol en la tabla perfiles
          const { data } = await supabase
            .from("perfiles")
            .select("rol")
            .eq("id", session.user.id)
            .single();
          if (data) setRol(data.rol);
        }
      } catch (error) {
        console.error("Error al obtener sesión inicial:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerSesionInicial();

    // 2. Escuchar cambios de estado en la autenticación (Login / Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from("perfiles")
          .select("rol")
          .eq("id", session.user.id)
          .single();
        if (data) setRol(data.rol);
      } else {
        setUser(null);
        setRol(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, rol, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

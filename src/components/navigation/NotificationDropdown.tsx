// src/components/navigation/NotificationDropdown.tsx
import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Building2,
  UserPlus,
  AlertCircle,
  Tag,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface NotificationDropdownProps {
  userId: string | undefined;
  isOpen: boolean;
  onToggle: () => void;
  onCloseOthers: () => void;
}

export function NotificationDropdown({
  userId,
  isOpen,
  onToggle,
  onCloseOthers,
}: NotificationDropdownProps) {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [tieneNuevas, setTieneNuevas] = useState<boolean>(false);

  // 🔔 Función para reproducir el sonido de alerta local
  const reproducirSonidoAlerta = () => {
    try {
      // Apunta directamente a la carpeta public de tu proyecto Vite
      const audio = new Audio("/sounds/notificacion.mp3");
      audio.volume = 0.5; // Volumen al 50%
      audio.play().catch((err) => {
        // Los navegadores modernos bloquean el autoplay si el usuario no ha interactuado previamente
        console.log("Audio prevenido por políticas del navegador:", err);
      });
    } catch (e) {
      console.error(
        "Error al intentar reproducir el sonido de notificación:",
        e,
      );
    }
  };
  useEffect(() => {
    if (!userId) return;

    const currentUserId = String(userId).trim();

    async function cargarNotificacionesIniciales() {
      try {
        const { data, error } = await supabase
          .from("notificaciones")
          .select("*")
          .eq("perfil_id", currentUserId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setNotificaciones(data || []);
        setTieneNuevas(data?.some((n) => !n.leido) || false);
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
      }
    }

    cargarNotificacionesIniciales();

    // 🔴 SUSCRIPCIÓN EN TIEMPO REAL ROBUSTA
    const channelName = `notificaciones-perfil-${currentUserId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificaciones",
        },
        (payload) => {
          const nuevaNotificacion = payload.new as any;
          const destinoId = String(nuevaNotificacion?.perfil_id || "").trim();

          // Verificar si la notificación es para este usuario exacto
          if (destinoId === currentUserId) {
            // 🔊 ¡Reproducir sonido y actualizar estado al instante!
            reproducirSonidoAlerta();

            setNotificaciones((prev) => {
              // Evitar duplicados si ya existe
              if (prev.some((n) => n.id === nuevaNotificacion.id)) return prev;
              return [nuevaNotificacion, ...prev];
            });
            setTieneNuevas(true);
          }
        },
      )
      .subscribe((status) => {
        console.log(`Estado del canal Realtime [${currentUserId}]:`, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const marcarComoLeida = async (id: number) => {
    try {
      const { error } = await supabase
        .from("notificaciones")
        .update({ leido: true })
        .eq("id", id)
        .eq("perfil_id", userId);

      if (error) throw error;

      setNotificaciones((prev) => {
        const actualizado = prev.map((n) =>
          n.id === id ? { ...n, leido: true } : n,
        );
        setTieneNuevas(actualizado.some((n) => !n.leido));
        return actualizado;
      });
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  const renderizarIconoTipo = (tipo: string) => {
    switch (tipo) {
      case "propiedad":
        return <Building2 className="size-4 text-emerald-400 shrink-0" />;
      case "sucursal":
        return <Building2 className="size-4 text-blue-400 shrink-0" />;
      case "agente":
        return <UserPlus className="size-4 text-blue-400 shrink-0" />;
      case "estado":
        return <Tag className="size-4 text-amber-400 shrink-0" />;
      default:
        return <AlertCircle className="size-4 text-purple-400 shrink-0" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          onToggle();
          onCloseOthers();
        }}
        className={`p-2 rounded-lg transition-colors relative cursor-pointer ${
          isOpen
            ? "bg-zinc-800 text-white"
            : "text-(--color-primary) hover:text-white hover:bg-zinc-800"
        }`}
        aria-label="Ver notificaciones"
      >
        <Bell className="w-5 h-5" />
        {tieneNuevas && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-zinc-900 animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 mt-2 w-80 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-20 overflow-hidden flex flex-col max-h-96 animate-fade-in">
            <header className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-700 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-blue-400 tracking-wider">
                Centro de Alertas
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">
                {notificaciones.length} totales
              </span>
            </header>

            <div className="overflow-y-auto grow scrollbar-thin divide-y divide-zinc-700/50 bg-zinc-800">
              {notificaciones.length === 0 ? (
                <p className="text-center py-8 text-zinc-500 text-[11px] font-medium">
                  No hay notificaciones registradas.
                </p>
              ) : (
                notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 transition-colors flex gap-3 items-start ${
                      !notif.leido ? "bg-zinc-950/30" : ""
                    }`}
                  >
                    <div className="mt-0.5">
                      {renderizarIconoTipo(notif.tipo)}
                    </div>
                    <div className="grow min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs font-bold truncate ${
                            !notif.leido ? "text-zinc-100" : "text-zinc-400"
                          }`}
                        >
                          {notif.titulo}
                        </h4>
                        <span className="text-[9px] text-zinc-500 font-semibold ml-2">
                          {new Date(notif.created_at).toLocaleTimeString(
                            "es-BO",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-3 leading-relaxed font-medium">
                        {notif.mensaje}
                      </p>
                    </div>
                    {!notif.leido && (
                      <button
                        onClick={() => marcarComoLeida(notif.id)}
                        className="size-5 rounded-md bg-zinc-900 hover:bg-emerald-600/20 text-zinc-500 hover:text-emerald-400 transition-all flex items-center justify-center shrink-0 cursor-pointer border border-zinc-700 hover:border-emerald-500/30"
                        title="Marcar como leído"
                      >
                        <Check className="size-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

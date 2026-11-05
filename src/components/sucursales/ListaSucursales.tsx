import { Building2 } from "lucide-react";
import { TablePageHeader } from "../../components/common/TablePageHeader";
import SucursalesTable from "../../components/sucursales/SucursalesTable";

export default function ListaSucursales() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabecera compartida */}
      <TablePageHeader
        titulo="Gestión de Sucursales"
        subtitulo="Control de oficinas regionales, direcciones y distribución física"
        iconoPrincipal={Building2}
        linkRegreso="/dashboard"
        textoLinkRegreso="Volver al Panel"
      />

      {/* Renderizado del nuevo componente de tabla de sucursales */}
      <SucursalesTable />
    </div>
  );
}

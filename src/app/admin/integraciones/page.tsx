import { Mail } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";

export default async function AdminIntegracionesPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-[clamp(1.5rem,5vw,2rem)]">Integraciones</h1>
      <p className="-mt-2 text-sm text-negro/60">
        Conexiones del sitio con otros sistemas del restaurante.
      </p>

      <div className="rounded-2xl border-2 border-negro/10 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg">SoftRestaurant</h2>
          <Badge variant="outline">No conectado</Badge>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-negro/70">
          Esta conexión sirve para que los pedidos del sitio lleguen directo a su punto de venta
          SoftRestaurant, sin capturarlos a mano. El sistema ya está preparado: los pedidos pasan
          por un solo punto y se pueden reenviar al punto de venta sin rehacer nada.
        </p>

        <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-negro/70">
          Qué necesitamos del restaurante
        </h3>
        <ol className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-negro/70">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rojo text-xs font-bold text-crema">
              1
            </span>
            Confirmar que su SoftRestaurant es versión 11 o &ldquo;SR en la nube&rdquo; con módulo de API.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rojo text-xs font-bold text-crema">
              2
            </span>
            Pedir a su distribuidor SoftRestaurant la llave (API key) y la URL del servicio.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rojo text-xs font-bold text-crema">
              3
            </span>
            Enviárnosla y nosotros hacemos el resto.
          </li>
        </ol>

        <a
          href="mailto:hola@nexo-ai.world?subject=Conectar%20SoftRestaurant%20-%20Tortas%20Don%20Manuel"
          className="btn-dark mt-6 inline-flex"
        >
          <Mail size={18} /> Escríbenos para conectarlo
        </a>
      </div>

      <p className="rounded-2xl border-2 border-negro/10 bg-white p-4 text-sm text-negro/60">
        Mientras tanto, no se pierde nada: los pedidos siguen llegando como siempre a la sección de
        Pedidos de este panel.
      </p>
    </div>
  );
}

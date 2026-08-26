import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../store";

export default function GroupsPage() {
  const { cursoId } = useParams<{ cursoId: string }>();
  const todosLosGrupos = useStore((s) => s.grupos);
  const grupos = useMemo(
    () => todosLosGrupos.filter((g) => g.cursoId === cursoId),
    [todosLosGrupos, cursoId],
  );
  const estudiantes = useStore((s) => s.estudiantes);
  const crearGrupo = useStore((s) => s.crearGrupo);
  const actualizarGrupo = useStore((s) => s.actualizarGrupo);
  const eliminarGrupo = useStore((s) => s.eliminarGrupo);
  const crearEstudiante = useStore((s) => s.crearEstudiante);
  const actualizarEstudiante = useStore((s) => s.actualizarEstudiante);
  const eliminarEstudiante = useStore((s) => s.eliminarEstudiante);

  const [nuevoGrupo, setNuevoGrupo] = useState("");
  const [grupoActivo, setGrupoActivo] = useState<string | null>(grupos[0]?.id ?? null);
  const [nuevoEstudiante, setNuevoEstudiante] = useState("");

  const grupoSeleccionado = grupos.find((g) => g.id === grupoActivo) ?? grupos[0] ?? null;
  const estudiantesDelGrupo = estudiantes
    .filter((e) => e.grupoId === grupoSeleccionado?.id)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  function agregarGrupo() {
    if (!nuevoGrupo.trim() || !cursoId) return;
    const id = crearGrupo(cursoId, nuevoGrupo.trim());
    setNuevoGrupo("");
    setGrupoActivo(id);
  }

  function agregarEstudiante() {
    if (!nuevoEstudiante.trim() || !grupoSeleccionado) return;
    crearEstudiante(grupoSeleccionado.id, nuevoEstudiante.trim());
    setNuevoEstudiante("");
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Grupos</h2>
        <div className="mb-3 flex gap-2">
          <input
            value={nuevoGrupo}
            onChange={(e) => setNuevoGrupo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && agregarGrupo()}
            placeholder="Ej. Grupo A"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
          <button
            onClick={agregarGrupo}
            disabled={!nuevoGrupo.trim()}
            className="rounded-lg bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
        <ul className="space-y-1">
          {grupos.map((g) => {
            const total = estudiantes.filter((e) => e.grupoId === g.id).length;
            return (
              <li key={g.id}>
                <button
                  onClick={() => setGrupoActivo(g.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                    grupoSeleccionado?.id === g.id
                      ? "bg-sky-50 text-sky-700 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{g.nombre}</span>
                  <span className="text-xs text-slate-400">{total} est.</span>
                </button>
              </li>
            );
          })}
          {grupos.length === 0 && (
            <p className="text-sm text-slate-500">Aún no has creado grupos para este curso.</p>
          )}
        </ul>
      </div>

      <div className="md:col-span-2">
        {grupoSeleccionado ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <input
                value={grupoSeleccionado.nombre}
                onChange={(e) => actualizarGrupo(grupoSeleccionado.id, { nombre: e.target.value })}
                className="text-lg font-semibold text-slate-800 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminar el grupo "${grupoSeleccionado.nombre}"?`)) {
                    eliminarGrupo(grupoSeleccionado.id);
                    setGrupoActivo(null);
                  }
                }}
                className="text-sm text-red-500 hover:underline"
              >
                Eliminar grupo
              </button>
            </div>

            <div className="mb-3 flex gap-2">
              <input
                value={nuevoEstudiante}
                onChange={(e) => setNuevoEstudiante(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && agregarEstudiante()}
                placeholder="Nombre del estudiante"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
              <button
                onClick={agregarEstudiante}
                disabled={!nuevoEstudiante.trim()}
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-50"
              >
                Agregar estudiante
              </button>
            </div>

            {estudiantesDelGrupo.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                Este grupo aún no tiene estudiantes.
              </div>
            ) : (
              <table className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Código</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantesDelGrupo.map((e) => (
                    <tr key={e.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <input
                          value={e.nombre}
                          onChange={(ev) => actualizarEstudiante(e.id, { nombre: ev.target.value })}
                          className="w-full border-none bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={e.codigo ?? ""}
                          onChange={(ev) => actualizarEstudiante(e.id, { codigo: ev.target.value })}
                          className="w-full border-none bg-transparent text-slate-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => eliminarEstudiante(e.id)}
                          className="text-slate-400 hover:text-red-500"
                          aria-label="Eliminar estudiante"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Crea un grupo para empezar a registrar estudiantes.
          </div>
        )}
      </div>
    </div>
  );
}

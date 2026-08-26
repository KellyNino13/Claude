import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../store";
import type { EstadoTema } from "../types";
import { avanceTemario } from "../calculos";

const estados: { valor: EstadoTema; etiqueta: string; color: string }[] = [
  { valor: "planeado", etiqueta: "Planeado", color: "bg-slate-100 text-slate-600" },
  { valor: "en_curso", etiqueta: "En curso", color: "bg-amber-100 text-amber-700" },
  { valor: "completado", etiqueta: "Completado", color: "bg-emerald-100 text-emerald-700" },
];

export default function SyllabusPage() {
  const { cursoId } = useParams<{ cursoId: string }>();
  const todosLosTemas = useStore((s) => s.temas);
  const temas = useMemo(
    () => todosLosTemas.filter((t) => t.cursoId === cursoId),
    [todosLosTemas, cursoId],
  );
  const crearTema = useStore((s) => s.crearTema);
  const actualizarTema = useStore((s) => s.actualizarTema);
  const eliminarTema = useStore((s) => s.eliminarTema);
  const moverTema = useStore((s) => s.moverTema);

  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const ordenados = [...temas].sort((a, b) => a.orden - b.orden);
  const avance = avanceTemario(temas);

  function agregar() {
    if (!nuevoTitulo.trim() || !cursoId) return;
    crearTema(cursoId, nuevoTitulo.trim());
    setNuevoTitulo("");
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Temario / Syllabus</h2>
          <p className="text-sm text-slate-500">
            {avance.completados} de {avance.total} temas completados ({avance.porcentaje}%)
          </p>
        </div>
        <div className="h-2 w-40 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-sky-500"
            style={{ width: `${avance.porcentaje}%` }}
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={nuevoTitulo}
          onChange={(e) => setNuevoTitulo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Nuevo tema o unidad del syllabus"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
        />
        <button
          onClick={agregar}
          disabled={!nuevoTitulo.trim()}
          className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-50"
        >
          Agregar tema
        </button>
      </div>

      {ordenados.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Agrega los temas o unidades de tu syllabus para empezar a hacerles seguimiento.
        </div>
      ) : (
        <ul className="space-y-2">
          {ordenados.map((tema, idx) => (
            <li
              key={tema.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <input
                  value={tema.titulo}
                  onChange={(e) => actualizarTema(tema.id, { titulo: e.target.value })}
                  className="w-full border-none bg-transparent font-medium text-slate-800 focus:outline-none"
                />
                <textarea
                  value={tema.descripcion ?? ""}
                  onChange={(e) => actualizarTema(tema.id, { descripcion: e.target.value })}
                  placeholder="Notas u objetivos del tema (opcional)"
                  rows={1}
                  className="mt-1 w-full resize-none border-none bg-transparent text-sm text-slate-500 focus:outline-none"
                />
                <input
                  type="date"
                  value={tema.fechaPlaneada ?? ""}
                  onChange={(e) => actualizarTema(tema.id, { fechaPlaneada: e.target.value })}
                  className="mt-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={tema.estado}
                  onChange={(e) => actualizarTema(tema.id, { estado: e.target.value as EstadoTema })}
                  className={`rounded-lg border-0 px-2 py-1 text-sm font-medium ${
                    estados.find((e) => e.valor === tema.estado)?.color
                  }`}
                >
                  {estados.map((e) => (
                    <option key={e.valor} value={e.valor}>
                      {e.etiqueta}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => moverTema(tema.id, "arriba")}
                  disabled={idx === 0}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                  aria-label="Mover arriba"
                >
                  ↑
                </button>
                <button
                  onClick={() => moverTema(tema.id, "abajo")}
                  disabled={idx === ordenados.length - 1}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                  aria-label="Mover abajo"
                >
                  ↓
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`¿Eliminar el tema "${tema.titulo}"?`)) eliminarTema(tema.id);
                  }}
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Eliminar tema"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

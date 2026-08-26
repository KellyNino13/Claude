import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../store";
import type { TipoActividad } from "../types";
import { sumaPonderaciones } from "../calculos";
import Modal from "../components/Modal";

const tipoEtiqueta: Record<TipoActividad, string> = {
  actividad: "Actividad",
  evaluacion: "Evaluación",
};

const tipoColor: Record<TipoActividad, string> = {
  actividad: "bg-sky-100 text-sky-700",
  evaluacion: "bg-purple-100 text-purple-700",
};

export default function ActivitiesPage() {
  const { cursoId } = useParams<{ cursoId: string }>();
  const todasLasActividades = useStore((s) => s.actividades);
  const actividades = useMemo(
    () => todasLasActividades.filter((a) => a.cursoId === cursoId),
    [todasLasActividades, cursoId],
  );
  const todosLosTemas = useStore((s) => s.temas);
  const temas = useMemo(
    () => todosLosTemas.filter((t) => t.cursoId === cursoId),
    [todosLosTemas, cursoId],
  );
  const crearActividad = useStore((s) => s.crearActividad);
  const actualizarActividad = useStore((s) => s.actualizarActividad);
  const eliminarActividad = useStore((s) => s.eliminarActividad);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    tipo: "actividad" as TipoActividad,
    temaId: "",
    fecha: "",
    ponderacion: 10,
    notaMaxima: 5,
    descripcion: "",
  });

  const totalPonderacion = sumaPonderaciones(actividades);
  const ordenadas = [...actividades].sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? ""));

  function crear() {
    if (!form.titulo.trim() || !cursoId) return;
    crearActividad(cursoId, {
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      temaId: form.temaId || undefined,
      fecha: form.fecha || undefined,
      ponderacion: Number(form.ponderacion) || 0,
      notaMaxima: Number(form.notaMaxima) || 5,
      descripcion: form.descripcion.trim() || undefined,
    });
    setMostrarModal(false);
    setForm({
      titulo: "",
      tipo: "actividad",
      temaId: "",
      fecha: "",
      ponderacion: 10,
      notaMaxima: 5,
      descripcion: "",
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Actividades y evaluaciones</h2>
          <p
            className={`text-sm ${
              totalPonderacion === 100 ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            Ponderación total: {totalPonderacion}%{" "}
            {totalPonderacion !== 100 && "(debería sumar 100%)"}
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          + Nueva actividad/evaluación
        </button>
      </div>

      {ordenadas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Diseña las actividades y evaluaciones del curso y asócialas a un tema del temario.
        </div>
      ) : (
        <ul className="space-y-2">
          {ordenadas.map((act) => {
            const tema = temas.find((t) => t.id === act.temaId);
            return (
              <li
                key={act.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tipoColor[act.tipo]}`}>
                      {tipoEtiqueta[act.tipo]}
                    </span>
                    <span className="font-medium text-slate-800">{act.titulo}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {tema ? `Tema: ${tema.titulo}` : "Sin tema asociado"}
                    {act.fecha && ` · ${act.fecha}`} · Ponderación {act.ponderacion}% · Nota máx.{" "}
                    {act.notaMaxima}
                  </p>
                  {act.descripcion && <p className="mt-1 text-sm text-slate-500">{act.descripcion}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <input
                    type="number"
                    value={act.ponderacion}
                    onChange={(e) => actualizarActividad(act.id, { ponderacion: Number(e.target.value) })}
                    className="w-16 rounded border border-slate-200 px-2 py-1 text-sm"
                    title="Ponderación (%)"
                  />
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Eliminar "${act.titulo}"?`)) eliminarActividad(act.id);
                    }}
                    className="text-slate-400 hover:text-red-500"
                    aria-label="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {mostrarModal && (
        <Modal titulo="Nueva actividad/evaluación" onCerrar={() => setMostrarModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Título</label>
              <input
                autoFocus
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ej. Quiz 1, Taller de derivadas, Parcial 1"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoActividad })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="actividad">Actividad</option>
                  <option value="evaluacion">Evaluación</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Tema relacionado</label>
                <select
                  value={form.temaId}
                  onChange={(e) => setForm({ ...form, temaId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">Sin tema</option>
                  {temas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.titulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Fecha</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Ponderación (%)</label>
                <input
                  type="number"
                  value={form.ponderacion}
                  onChange={(e) => setForm({ ...form, ponderacion: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Nota máxima</label>
                <input
                  type="number"
                  value={form.notaMaxima}
                  onChange={(e) => setForm({ ...form, notaMaxima: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Descripción (opcional)</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMostrarModal(false)}
                className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={crear}
                disabled={!form.titulo.trim()}
                className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-50"
              >
                Crear
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

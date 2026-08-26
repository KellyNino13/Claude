import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { avanceTemario } from "../calculos";
import Modal from "../components/Modal";

export default function CoursesPage() {
  const cursos = useStore((s) => s.cursos);
  const temas = useStore((s) => s.temas);
  const grupos = useStore((s) => s.grupos);
  const crearCurso = useStore((s) => s.crearCurso);
  const eliminarCurso = useStore((s) => s.eliminarCurso);
  const navigate = useNavigate();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  function crear() {
    if (!nombre.trim()) return;
    const id = crearCurso(nombre.trim(), codigo.trim() || undefined, descripcion.trim() || undefined);
    setMostrarModal(false);
    setNombre("");
    setCodigo("");
    setDescripcion("");
    navigate(`/curso/${id}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Planeador de clases</h1>
          <p className="text-slate-500">
            Organiza el syllabus, diseña actividades y evaluaciones, y lleva el control de
            calificaciones por grupo.
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700"
        >
          + Nueva asignatura
        </button>
      </div>

      {cursos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          Aún no tienes asignaturas. Crea la primera para empezar a planear tus clases.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((curso) => {
            const temasDelCurso = temas.filter((t) => t.cursoId === curso.id);
            const gruposDelCurso = grupos.filter((g) => g.cursoId === curso.id);
            const avance = avanceTemario(temasDelCurso);
            return (
              <div
                key={curso.id}
                className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => {
                    if (window.confirm(`¿Eliminar la asignatura "${curso.nombre}" y todos sus datos?`)) {
                      eliminarCurso(curso.id);
                    }
                  }}
                  className="absolute right-3 top-3 hidden text-slate-400 hover:text-red-500 group-hover:block"
                  aria-label="Eliminar curso"
                >
                  ✕
                </button>
                <button className="text-left" onClick={() => navigate(`/curso/${curso.id}`)}>
                  <h2 className="text-lg font-semibold text-slate-800">{curso.nombre}</h2>
                  {curso.codigo && <p className="text-sm text-slate-500">{curso.codigo}</p>}
                  {curso.descripcion && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{curso.descripcion}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>{gruposDelCurso.length} grupo(s)</span>
                    <span>
                      {avance.completados}/{avance.total} temas · {avance.porcentaje}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-sky-500"
                      style={{ width: `${avance.porcentaje}%` }}
                    />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {mostrarModal && (
        <Modal titulo="Nueva asignatura" onCerrar={() => setMostrarModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Nombre de la asignatura</label>
              <input
                autoFocus
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Cálculo Diferencial"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Código (opcional)</label>
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej. MAT-101"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Descripción (opcional)</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
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
                disabled={!nombre.trim()}
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

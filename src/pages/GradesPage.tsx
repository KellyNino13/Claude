import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../store";
import { promedioGrupo, promedioPonderadoEstudiante } from "../calculos";

export default function GradesPage() {
  const { cursoId } = useParams<{ cursoId: string }>();
  const todosLosGrupos = useStore((s) => s.grupos);
  const grupos = useMemo(
    () => todosLosGrupos.filter((g) => g.cursoId === cursoId),
    [todosLosGrupos, cursoId],
  );
  const estudiantes = useStore((s) => s.estudiantes);
  const todasLasActividades = useStore((s) => s.actividades);
  const actividades = useMemo(
    () => todasLasActividades.filter((a) => a.cursoId === cursoId),
    [todasLasActividades, cursoId],
  );
  const calificaciones = useStore((s) => s.calificaciones);
  const setCalificacion = useStore((s) => s.setCalificacion);

  const [grupoId, setGrupoId] = useState<string>(grupos[0]?.id ?? "");
  const grupoActivo = grupos.find((g) => g.id === grupoId) ?? grupos[0];

  const estudiantesDelGrupo = estudiantes
    .filter((e) => e.grupoId === grupoActivo?.id)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const actividadesOrdenadas = [...actividades].sort((a, b) =>
    (a.fecha ?? "").localeCompare(b.fecha ?? ""),
  );

  const promedioDelGrupo = grupoActivo
    ? promedioGrupo(estudiantesDelGrupo, actividades, calificaciones)
    : null;

  if (grupos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Primero crea un grupo en la pestaña "Grupos" para registrar calificaciones.
      </div>
    );
  }

  if (actividades.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Primero crea actividades/evaluaciones en la pestaña correspondiente.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Grupo:</label>
          <select
            value={grupoActivo?.id}
            onChange={(e) => setGrupoId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
        </div>
        {promedioDelGrupo !== null && (
          <p className="text-sm text-slate-600">
            Promedio del grupo:{" "}
            <span className="font-semibold text-slate-800">{promedioDelGrupo.toFixed(2)}</span> / 5.0
          </p>
        )}
      </div>

      {estudiantesDelGrupo.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Este grupo aún no tiene estudiantes.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-max text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2">Estudiante</th>
                {actividadesOrdenadas.map((act) => (
                  <th key={act.id} className="px-3 py-2 text-center">
                    <div>{act.titulo}</div>
                    <div className="text-xs font-normal text-slate-400">
                      {act.ponderacion}% · /{act.notaMaxima}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2 text-center">Promedio (/5.0)</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesDelGrupo.map((est) => {
                const promedio = promedioPonderadoEstudiante(est.id, actividades, calificaciones);
                return (
                  <tr key={est.id} className="border-t border-slate-100">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium text-slate-700">
                      {est.nombre}
                    </td>
                    {actividadesOrdenadas.map((act) => {
                      const cal = calificaciones.find(
                        (c) => c.actividadId === act.id && c.estudianteId === est.id,
                      );
                      return (
                        <td key={act.id} className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={act.notaMaxima}
                            step={0.1}
                            value={cal?.nota ?? ""}
                            onChange={(e) => {
                              const valor = e.target.value;
                              setCalificacion(act.id, est.id, valor === "" ? null : Number(valor));
                            }}
                            className="w-16 rounded border border-slate-200 px-2 py-1 text-center focus:border-sky-500 focus:outline-none"
                          />
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center font-semibold text-slate-800">
                      {promedio !== null ? promedio.toFixed(2) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

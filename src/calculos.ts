import type { Actividad, Calificacion, Estudiante, Tema } from "./types";

export function promedioPonderadoEstudiante(
  estudianteId: string,
  actividades: Actividad[],
  calificaciones: Calificacion[],
): number | null {
  let sumaPonderada = 0;
  let sumaPonderaciones = 0;
  for (const act of actividades) {
    const cal = calificaciones.find(
      (c) => c.actividadId === act.id && c.estudianteId === estudianteId,
    );
    if (!cal || cal.nota === null) continue;
    const notaSobre5 = act.notaMaxima > 0 ? (cal.nota / act.notaMaxima) * 5 : 0;
    sumaPonderada += notaSobre5 * act.ponderacion;
    sumaPonderaciones += act.ponderacion;
  }
  if (sumaPonderaciones === 0) return null;
  return sumaPonderada / sumaPonderaciones;
}

export function promedioGrupo(
  estudiantes: Estudiante[],
  actividades: Actividad[],
  calificaciones: Calificacion[],
): number | null {
  const promedios = estudiantes
    .map((e) => promedioPonderadoEstudiante(e.id, actividades, calificaciones))
    .filter((p): p is number => p !== null);
  if (promedios.length === 0) return null;
  return promedios.reduce((a, b) => a + b, 0) / promedios.length;
}

export function sumaPonderaciones(actividades: Actividad[]): number {
  return actividades.reduce((acc, a) => acc + a.ponderacion, 0);
}

export function avanceTemario(temas: Tema[]): { total: number; completados: number; porcentaje: number } {
  const total = temas.length;
  const completados = temas.filter((t) => t.estado === "completado").length;
  const porcentaje = total === 0 ? 0 : Math.round((completados / total) * 100);
  return { total, completados, porcentaje };
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Actividad,
  Calificacion,
  Curso,
  Estudiante,
  Grupo,
  Tema,
} from "./types";

function id() {
  return crypto.randomUUID();
}

interface DataState {
  cursos: Curso[];
  temas: Tema[];
  grupos: Grupo[];
  estudiantes: Estudiante[];
  actividades: Actividad[];
  calificaciones: Calificacion[];
}

interface Store extends DataState {
  // cursos
  crearCurso: (nombre: string, codigo?: string, descripcion?: string) => string;
  actualizarCurso: (id: string, cambios: Partial<Curso>) => void;
  eliminarCurso: (id: string) => void;

  // temas
  crearTema: (cursoId: string, titulo: string) => string;
  actualizarTema: (id: string, cambios: Partial<Tema>) => void;
  eliminarTema: (id: string) => void;
  moverTema: (id: string, direccion: "arriba" | "abajo") => void;

  // grupos
  crearGrupo: (cursoId: string, nombre: string) => string;
  actualizarGrupo: (id: string, cambios: Partial<Grupo>) => void;
  eliminarGrupo: (id: string) => void;

  // estudiantes
  crearEstudiante: (grupoId: string, nombre: string, codigo?: string) => string;
  actualizarEstudiante: (id: string, cambios: Partial<Estudiante>) => void;
  eliminarEstudiante: (id: string) => void;

  // actividades
  crearActividad: (cursoId: string, datos: Partial<Actividad> & { titulo: string }) => string;
  actualizarActividad: (id: string, cambios: Partial<Actividad>) => void;
  eliminarActividad: (id: string) => void;

  // calificaciones
  setCalificacion: (actividadId: string, estudianteId: string, nota: number | null) => void;

  // import/export
  exportarDatos: () => string;
  importarDatos: (json: string) => void;
  reiniciarDatos: () => void;
}

const estadoInicial: DataState = {
  cursos: [],
  temas: [],
  grupos: [],
  estudiantes: [],
  actividades: [],
  calificaciones: [],
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...estadoInicial,

      crearCurso: (nombre, codigo, descripcion) => {
        const nuevoId = id();
        const curso: Curso = {
          id: nuevoId,
          nombre,
          codigo,
          descripcion,
          creadoEn: new Date().toISOString(),
        };
        set((s) => ({ cursos: [...s.cursos, curso] }));
        return nuevoId;
      },
      actualizarCurso: (cursoId, cambios) =>
        set((s) => ({
          cursos: s.cursos.map((c) => (c.id === cursoId ? { ...c, ...cambios } : c)),
        })),
      eliminarCurso: (cursoId) =>
        set((s) => {
          const gruposDelCurso = s.grupos.filter((g) => g.cursoId === cursoId).map((g) => g.id);
          const actividadesDelCurso = s.actividades
            .filter((a) => a.cursoId === cursoId)
            .map((a) => a.id);
          return {
            cursos: s.cursos.filter((c) => c.id !== cursoId),
            temas: s.temas.filter((t) => t.cursoId !== cursoId),
            grupos: s.grupos.filter((g) => g.cursoId !== cursoId),
            estudiantes: s.estudiantes.filter((e) => !gruposDelCurso.includes(e.grupoId)),
            actividades: s.actividades.filter((a) => a.cursoId !== cursoId),
            calificaciones: s.calificaciones.filter(
              (c) => !actividadesDelCurso.includes(c.actividadId),
            ),
          };
        }),

      crearTema: (cursoId, titulo) => {
        const nuevoId = id();
        const ordenMax = Math.max(
          0,
          ...get()
            .temas.filter((t) => t.cursoId === cursoId)
            .map((t) => t.orden),
        );
        const tema: Tema = {
          id: nuevoId,
          cursoId,
          titulo,
          orden: ordenMax + 1,
          estado: "planeado",
        };
        set((s) => ({ temas: [...s.temas, tema] }));
        return nuevoId;
      },
      actualizarTema: (temaId, cambios) =>
        set((s) => ({
          temas: s.temas.map((t) => (t.id === temaId ? { ...t, ...cambios } : t)),
        })),
      eliminarTema: (temaId) =>
        set((s) => ({
          temas: s.temas.filter((t) => t.id !== temaId),
          actividades: s.actividades.map((a) =>
            a.temaId === temaId ? { ...a, temaId: undefined } : a,
          ),
        })),
      moverTema: (temaId, direccion) =>
        set((s) => {
          const tema = s.temas.find((t) => t.id === temaId);
          if (!tema) return s;
          const delCurso = s.temas
            .filter((t) => t.cursoId === tema.cursoId)
            .sort((a, b) => a.orden - b.orden);
          const idx = delCurso.findIndex((t) => t.id === temaId);
          const otroIdx = direccion === "arriba" ? idx - 1 : idx + 1;
          if (otroIdx < 0 || otroIdx >= delCurso.length) return s;
          const otro = delCurso[otroIdx];
          const ordenTemp = tema.orden;
          return {
            temas: s.temas.map((t) => {
              if (t.id === tema.id) return { ...t, orden: otro.orden };
              if (t.id === otro.id) return { ...t, orden: ordenTemp };
              return t;
            }),
          };
        }),

      crearGrupo: (cursoId, nombre) => {
        const nuevoId = id();
        set((s) => ({ grupos: [...s.grupos, { id: nuevoId, cursoId, nombre }] }));
        return nuevoId;
      },
      actualizarGrupo: (grupoId, cambios) =>
        set((s) => ({
          grupos: s.grupos.map((g) => (g.id === grupoId ? { ...g, ...cambios } : g)),
        })),
      eliminarGrupo: (grupoId) =>
        set((s) => {
          const estudiantesDelGrupo = s.estudiantes
            .filter((e) => e.grupoId === grupoId)
            .map((e) => e.id);
          return {
            grupos: s.grupos.filter((g) => g.id !== grupoId),
            estudiantes: s.estudiantes.filter((e) => e.grupoId !== grupoId),
            calificaciones: s.calificaciones.filter(
              (c) => !estudiantesDelGrupo.includes(c.estudianteId),
            ),
          };
        }),

      crearEstudiante: (grupoId, nombre, codigo) => {
        const nuevoId = id();
        set((s) => ({
          estudiantes: [...s.estudiantes, { id: nuevoId, grupoId, nombre, codigo }],
        }));
        return nuevoId;
      },
      actualizarEstudiante: (estudianteId, cambios) =>
        set((s) => ({
          estudiantes: s.estudiantes.map((e) =>
            e.id === estudianteId ? { ...e, ...cambios } : e,
          ),
        })),
      eliminarEstudiante: (estudianteId) =>
        set((s) => ({
          estudiantes: s.estudiantes.filter((e) => e.id !== estudianteId),
          calificaciones: s.calificaciones.filter((c) => c.estudianteId !== estudianteId),
        })),

      crearActividad: (cursoId, datos) => {
        const nuevoId = id();
        const actividad: Actividad = {
          id: nuevoId,
          cursoId,
          tipo: datos.tipo ?? "actividad",
          titulo: datos.titulo,
          descripcion: datos.descripcion,
          temaId: datos.temaId,
          fecha: datos.fecha,
          ponderacion: datos.ponderacion ?? 0,
          notaMaxima: datos.notaMaxima ?? 5,
        };
        set((s) => ({ actividades: [...s.actividades, actividad] }));
        return nuevoId;
      },
      actualizarActividad: (actividadId, cambios) =>
        set((s) => ({
          actividades: s.actividades.map((a) =>
            a.id === actividadId ? { ...a, ...cambios } : a,
          ),
        })),
      eliminarActividad: (actividadId) =>
        set((s) => ({
          actividades: s.actividades.filter((a) => a.id !== actividadId),
          calificaciones: s.calificaciones.filter((c) => c.actividadId !== actividadId),
        })),

      setCalificacion: (actividadId, estudianteId, nota) =>
        set((s) => {
          const existente = s.calificaciones.find(
            (c) => c.actividadId === actividadId && c.estudianteId === estudianteId,
          );
          if (existente) {
            return {
              calificaciones: s.calificaciones.map((c) =>
                c.id === existente.id ? { ...c, nota } : c,
              ),
            };
          }
          return {
            calificaciones: [
              ...s.calificaciones,
              { id: id(), actividadId, estudianteId, nota },
            ],
          };
        }),

      exportarDatos: () => {
        const { cursos, temas, grupos, estudiantes, actividades, calificaciones } = get();
        return JSON.stringify(
          { cursos, temas, grupos, estudiantes, actividades, calificaciones },
          null,
          2,
        );
      },
      importarDatos: (json) => {
        const datos = JSON.parse(json) as Partial<DataState>;
        set({
          cursos: datos.cursos ?? [],
          temas: datos.temas ?? [],
          grupos: datos.grupos ?? [],
          estudiantes: datos.estudiantes ?? [],
          actividades: datos.actividades ?? [],
          calificaciones: datos.calificaciones ?? [],
        });
      },
      reiniciarDatos: () => set(estadoInicial),
    }),
    { name: "planeador-clases" },
  ),
);

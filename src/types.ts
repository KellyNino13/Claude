export type EstadoTema = "planeado" | "en_curso" | "completado";

export type TipoActividad = "actividad" | "evaluacion";

export interface Curso {
  id: string;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  creadoEn: string;
}

export interface Tema {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion?: string;
  orden: number;
  estado: EstadoTema;
  fechaPlaneada?: string;
}

export interface Grupo {
  id: string;
  cursoId: string;
  nombre: string;
}

export interface Estudiante {
  id: string;
  grupoId: string;
  nombre: string;
  codigo?: string;
}

export interface Actividad {
  id: string;
  cursoId: string;
  temaId?: string;
  tipo: TipoActividad;
  titulo: string;
  descripcion?: string;
  fecha?: string;
  ponderacion: number; // porcentaje 0-100
  notaMaxima: number;
}

export interface Calificacion {
  id: string;
  actividadId: string;
  estudianteId: string;
  nota: number | null;
}

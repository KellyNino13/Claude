# Planeador de Clases

Aplicación web para planear una asignatura a partir de su syllabus: seguimiento de temáticas, diseño de actividades y evaluaciones, y control de calificaciones de los diferentes grupos de un mismo curso.

## Funcionalidades

- **Asignaturas**: crea una o varias materias.
- **Temario / Syllabus**: registra las unidades o temas del curso, ordénalos y marca su avance (planeado, en curso, completado).
- **Grupos y estudiantes**: administra varios grupos por asignatura, cada uno con su propia lista de estudiantes.
- **Actividades y evaluaciones**: diseña actividades y evaluaciones asociadas a un tema, con fecha, ponderación (%) y nota máxima.
- **Calificaciones**: ingresa las notas de cada estudiante por actividad/evaluación y consulta el promedio ponderado individual y del grupo.
- **Exportar / Importar**: descarga toda la información en un archivo JSON de respaldo y vuelve a cargarla cuando lo necesites.

Todos los datos se guardan localmente en el navegador (localStorage); no requiere servidor ni base de datos.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción
```

Construido con React, TypeScript, Vite, Tailwind CSS, React Router y Zustand.

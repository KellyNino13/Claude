import { useRef } from "react";
import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../store";

const pestañas = [
  { to: "temario", etiqueta: "Temario" },
  { to: "grupos", etiqueta: "Grupos" },
  { to: "actividades", etiqueta: "Actividades y evaluaciones" },
  { to: "calificaciones", etiqueta: "Calificaciones" },
];

export default function CourseLayout() {
  const { cursoId } = useParams<{ cursoId: string }>();
  const curso = useStore((s) => s.cursos.find((c) => c.id === cursoId));
  const navigate = useNavigate();
  const exportarDatos = useStore((s) => s.exportarDatos);
  const importarDatos = useStore((s) => s.importarDatos);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!curso) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <p className="text-slate-600">Este curso no existe.</p>
        <Link to="/" className="text-sky-600 underline">
          Volver a mis cursos
        </Link>
      </div>
    );
  }

  function descargarBackup() {
    const json = exportarDatos();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planeador-clases-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function subirBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      try {
        importarDatos(String(lector.result));
        window.alert("Datos importados correctamente.");
      } catch {
        window.alert("El archivo no tiene un formato válido.");
      }
    };
    lector.readAsText(archivo);
    e.target.value = "";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-sky-600 hover:underline"
            >
              ← Mis cursos
            </button>
            <h1 className="text-xl font-bold text-slate-800">{curso.nombre}</h1>
            {curso.codigo && <p className="text-sm text-slate-500">{curso.codigo}</p>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={descargarBackup}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Exportar datos
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Importar datos
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={subirBackup}
            />
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-4">
          {pestañas.map((p) => (
            <NavLink
              key={p.to}
              to={p.to}
              className={({ isActive }) =>
                `rounded-t-lg px-4 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-slate-50 text-sky-700 border border-b-0 border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`
              }
            >
              {p.etiqueta}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

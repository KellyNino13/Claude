import { Navigate, Route, Routes } from "react-router-dom";
import CourseLayout from "./pages/CourseLayout";
import CoursesPage from "./pages/CoursesPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import GradesPage from "./pages/GradesPage";
import GroupsPage from "./pages/GroupsPage";
import SyllabusPage from "./pages/SyllabusPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CoursesPage />} />
      <Route path="/curso/:cursoId" element={<CourseLayout />}>
        <Route index element={<Navigate to="temario" replace />} />
        <Route path="temario" element={<SyllabusPage />} />
        <Route path="grupos" element={<GroupsPage />} />
        <Route path="actividades" element={<ActivitiesPage />} />
        <Route path="calificaciones" element={<GradesPage />} />
      </Route>
    </Routes>
  );
}

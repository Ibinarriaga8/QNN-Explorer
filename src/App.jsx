import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { BasicsPage } from "./pages/BasicsPage";
import { CircuitsPage } from "./pages/CircuitsPage";
import { ExamplesPage } from "./pages/ExamplesPage";
import { HomePage } from "./pages/HomePage";
import { InsightsPage } from "./pages/InsightsPage";
import { LabPage } from "./pages/LabPage";
import { TrainingPage } from "./pages/TrainingPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/basics" element={<BasicsPage />} />
          <Route path="/circuits" element={<CircuitsPage />} />
          <Route path="/lab" element={<LabPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/examples" element={<ExamplesPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

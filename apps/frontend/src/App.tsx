import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import CommandCenter from "./pages/CommandCenter";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/errors/Forbidden";
import ServerError from "./pages/errors/ServerError";
import { ProtectedShell } from "./components/origen/ProtectedShell";
import { RouteFallback } from "./components/origen/RouteFallback";

// One lazy import per page — each becomes its own JS chunk.
const ProjectOverview = lazy(() => import("./pages/ProjectOverview"));
const Tickets = lazy(() => import("./pages/CollaborationRoom"));
// <DOMAIN_PLACEHOLDER>: one lazy import per requirement line.
const Line1 = lazy(() => import("./pages/Line1"));
const Line2 = lazy(() => import("./pages/Line2"));
const Line3 = lazy(() => import("./pages/Line3"));
const Line4 = lazy(() => import("./pages/Line4"));
const Line5 = lazy(() => import("./pages/Line5"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/500" element={<ServerError />} />
        <Route element={<ProtectedShell />}>
          <Route path="/" element={<CommandCenter />} />
          <Route
            path="/project"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ProjectOverview />
              </Suspense>
            }
          />
          <Route
            path="/r1"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Line1 />
              </Suspense>
            }
          />
          <Route
            path="/r2"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Line2 />
              </Suspense>
            }
          />
          <Route
            path="/r3"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Line3 />
              </Suspense>
            }
          />
          <Route
            path="/r4"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Line4 />
              </Suspense>
            }
          />
          <Route
            path="/r5"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Line5 />
              </Suspense>
            }
          />
          <Route
            path="/collab"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Tickets />
              </Suspense>
            }
          />
          <Route
            path="/reports"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Reports />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

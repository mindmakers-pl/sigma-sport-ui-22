import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayoutNew from "./components/AppLayoutNew";
import Dashboard from "./pages/Dashboard";
import AthletePanel from "./pages/AthletePanel";
import AdminPanel from "./pages/AdminPanel";
import Athletes from "./pages/Athletes";
import AthleteProfile from "./pages/AthleteProfile";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import ClubManagement from "./pages/ClubManagement";
import Settings from "./pages/Settings";
import Library from "./pages/Library";
import Training from "./pages/Training";
import ExerciseDetail from "./pages/ExerciseDetail";
import QuestionnaireDetail from "./pages/QuestionnaireDetail";
import ScanGame from "./pages/ScanGame";
import ControlGame from "./pages/ControlGame";
import FocusGame from "./pages/FocusGame";
import TrackerGame from "./pages/TrackerGame";
import MemoGame from "./pages/MemoGame";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SessionDetail from "./pages/SessionDetail";
import TrainingDetail from "./pages/TrainingDetail";
import ProgressReport from "./pages/ProgressReport";
import SixSigmaReport from "./pages/SixSigmaReport";
import { useEffect } from "react";
import { addSigmaSigmaToStorage } from "./data/mockAthletes";
import { addMockCompletedSessionToStorage } from "./data/mockCompletedSession";

const queryClient = new QueryClient();

const App = () => {
  // Initialize Sigma Sigma mock data on app load
  useEffect(() => {
    addSigmaSigmaToStorage();
    addMockCompletedSessionToStorage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/landing" element={<Index />} />
            <Route path="/" element={<AppLayoutNew><Dashboard /></AppLayoutNew>} />
            <Route path="/panel-zawodnika" element={<AppLayoutNew><AthletePanel /></AppLayoutNew>} />
            <Route path="/panel-admin" element={<AppLayoutNew><AdminPanel /></AppLayoutNew>} />
            <Route path="/zawodnicy" element={<AppLayoutNew><Athletes /></AppLayoutNew>} />
            <Route path="/zawodnicy/:id" element={<AppLayoutNew><AthleteProfile /></AppLayoutNew>} />
            <Route path="/zawodnicy/:athleteId/sesja/:sessionId" element={<AppLayoutNew><SessionDetail /></AppLayoutNew>} />
            <Route path="/zawodnicy/:athleteId/sesja/:sessionId/six-sigma" element={<AppLayoutNew><SixSigmaReport /></AppLayoutNew>} />
            <Route path="/zawodnicy/:athleteId/trening/:trainingId" element={<AppLayoutNew><TrainingDetail /></AppLayoutNew>} />
            <Route path="/zawodnicy/:athleteId/postepy/:gameType" element={<AppLayoutNew><ProgressReport /></AppLayoutNew>} />
            <Route path="/kluby" element={<AppLayoutNew><Clubs /></AppLayoutNew>} />
            <Route path="/kluby/:id" element={<AppLayoutNew><ClubDetail /></AppLayoutNew>} />
            <Route path="/kluby/:id/zarzadzaj" element={<AppLayoutNew><ClubManagement /></AppLayoutNew>} />
            <Route path="/biblioteka" element={<AppLayoutNew><Library /></AppLayoutNew>} />
            <Route path="/biblioteka/cwiczenie/:id" element={<AppLayoutNew><ExerciseDetail /></AppLayoutNew>} />
            <Route path="/biblioteka/kwestionariusz/:id" element={<AppLayoutNew><QuestionnaireDetail /></AppLayoutNew>} />
            <Route path="/trening" element={<AppLayoutNew><Training /></AppLayoutNew>} />
            <Route path="/ustawienia" element={<AppLayoutNew><Settings /></AppLayoutNew>} />
            <Route path="/scan/:athleteId" element={<ScanGame />} />
            <Route path="/control/:athleteId" element={<ControlGame />} />
            <Route path="/focus/:athleteId" element={<FocusGame />} />
            <Route path="/tracker/:athleteId" element={<TrackerGame />} />
            <Route path="/memo/:athleteId" element={<MemoGame />} />
            <Route path="/scan/training" element={<ScanGame mode="training" />} />
            <Route path="/control/training" element={<ControlGame mode="training" />} />
            <Route path="/focus/training" element={<FocusGame mode="training" />} />
            <Route path="/tracker/training" element={<TrackerGame mode="training" />} />
            <Route path="/memo/training" element={<MemoGame mode="training" />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

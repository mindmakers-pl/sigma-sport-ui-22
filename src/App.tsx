import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SimpleLayout from "./components/SimpleLayout";
import Dashboard from "./pages/Dashboard";
import Athletes from "./pages/Athletes";
import AthleteProfile from "./pages/AthleteProfile";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import ClubManagement from "./pages/ClubManagement";
import Settings from "./pages/Settings";
import Library from "./pages/Library";
import ExerciseDetail from "./pages/ExerciseDetail";
import QuestionnaireDetail from "./pages/QuestionnaireDetail";
import ScanGame from "./pages/ScanGame";
import ControlGame from "./pages/ControlGame";
import FocusGame from "./pages/FocusGame";
import TrackerGame from "./pages/TrackerGame";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<Index />} />
          <Route path="/" element={<SimpleLayout><Dashboard /></SimpleLayout>} />
          <Route path="/zawodnicy" element={<SimpleLayout><Athletes /></SimpleLayout>} />
          <Route path="/zawodnicy/:id" element={<SimpleLayout><AthleteProfile /></SimpleLayout>} />
          <Route path="/kluby" element={<SimpleLayout><Clubs /></SimpleLayout>} />
          <Route path="/kluby/:id" element={<SimpleLayout><ClubDetail /></SimpleLayout>} />
          <Route path="/kluby/:id/zarzadzaj" element={<SimpleLayout><ClubManagement /></SimpleLayout>} />
          <Route path="/biblioteka" element={<SimpleLayout><Library /></SimpleLayout>} />
          <Route path="/biblioteka/cwiczenie/:id" element={<SimpleLayout><ExerciseDetail /></SimpleLayout>} />
          <Route path="/biblioteka/kwestionariusz/:id" element={<SimpleLayout><QuestionnaireDetail /></SimpleLayout>} />
          <Route path="/ustawienia" element={<SimpleLayout><Settings /></SimpleLayout>} />
          <Route path="/scan/:athleteId" element={<ScanGame />} />
          <Route path="/control/:athleteId" element={<ControlGame />} />
          <Route path="/focus/:athleteId" element={<FocusGame />} />
          <Route path="/tracker/:athleteId" element={<TrackerGame />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

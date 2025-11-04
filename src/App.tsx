import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
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
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/zawodnicy" element={<AppLayout><Athletes /></AppLayout>} />
          <Route path="/zawodnicy/:id" element={<AppLayout><AthleteProfile /></AppLayout>} />
          <Route path="/kluby" element={<AppLayout><Clubs /></AppLayout>} />
          <Route path="/kluby/:id" element={<AppLayout><ClubDetail /></AppLayout>} />
          <Route path="/kluby/:id/zarzadzaj" element={<ClubManagement />} />
          <Route path="/biblioteka" element={<AppLayout><Library /></AppLayout>} />
          <Route path="/biblioteka/cwiczenie/:id" element={<ExerciseDetail />} />
          <Route path="/biblioteka/kwestionariusz/:id" element={<QuestionnaireDetail />} />
          <Route path="/ustawienia" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="/scan/:athleteId" element={<ScanGame />} />
          <Route path="/control/:athleteId" element={<ControlGame />} />
          <Route path="/focus/:athleteId" element={<FocusGame />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

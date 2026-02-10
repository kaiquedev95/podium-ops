import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Schedule from "./pages/Schedule";
import ServiceOrders from "./pages/ServiceOrders";
import Financial from "./pages/Financial";
import Pendencies from "./pages/Pendencies";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/agendamentos" element={<Schedule />} />
            <Route path="/ordens-servico" element={<ServiceOrders />} />
            <Route path="/financeiro" element={<Financial />} />
            <Route path="/pendencias" element={<Pendencies />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

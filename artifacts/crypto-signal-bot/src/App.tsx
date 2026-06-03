import { Layout } from "@/components/layout/Layout";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Watchlist from "@/pages/watchlist";
import Positions from "@/pages/positions";
import Orders from "@/pages/orders";
import RiskGuardian from "@/pages/risk";
import Settings from "@/pages/settings";
import Health from "@/pages/health";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/watchlist" component={Watchlist}/>
        <Route path="/positions" component={Positions}/>
        <Route path="/orders" component={Orders}/>
        <Route path="/risk" component={RiskGuardian}/>
        <Route path="/settings" component={Settings}/>
        <Route path="/health" component={Health}/>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

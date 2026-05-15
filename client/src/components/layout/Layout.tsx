import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Activity, 
  LayoutDashboard, 
  ListOrdered, 
  ShieldAlert, 
  Settings, 
  History,
  TrendingUp,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ListOrdered, label: "Watchlist", href: "/watchlist" },
  { icon: Wallet, label: "Positions", href: "/positions" },
  { icon: History, label: "Orders", href: "/orders" },
  { icon: ShieldAlert, label: "Risk Guardian", href: "/risk" },
  { icon: Settings, label: "Exchange Settings", href: "/settings" },
  { icon: Activity, label: "System Health", href: "/health" },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/10 glass-panel flex-shrink-0 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/50 glow-box">
            <TrendingUp className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wider gradient-text">CRYPTO.SIG</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Paper Mode</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                  )}
                  data-testid={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_8px_hsl(var(--primary))]"></div>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="p-4 rounded-xl bg-secondary/50 border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-mono">CPU</span>
              <span className="text-success font-mono">12%</span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5">
              <div className="bg-success h-1.5 rounded-full" style={{ width: "12%" }}></div>
            </div>
            
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-muted-foreground font-mono">API Latency</span>
              <span className="text-warning font-mono">45ms</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden flex flex-col min-h-screen relative">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        
        <header className="h-16 border-b border-white/10 glass-panel flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-secondary/80 border border-white/10 text-xs font-mono text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              Bitget: CONNECTED
            </div>
            <div className="px-3 py-1 rounded-full bg-secondary/80 border border-white/10 text-xs font-mono text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              Binance: CONNECTED
            </div>
            <div className="px-3 py-1 rounded-full bg-secondary/80 border border-white/10 text-xs font-mono text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
              BTCC: DISCONNECTED
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">Admin User</div>
              <div className="text-xs text-primary font-mono">Simulated Trading</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-secondary border border-primary/30 flex items-center justify-center shadow-[0_0_10px_hsl(var(--primary)/0.2)]">
              <ShieldAlert className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
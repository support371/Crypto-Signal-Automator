import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap,
  AlertTriangle,
  Clock,
  ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const recentSignals = [
  { id: 1, pair: "SOL/USDT", type: "MOMENTUM", score: 92, action: "BUY", price: "145.23", time: "2 mins ago", status: "EXECUTED" },
  { id: 2, pair: "MEME/USDT", type: "NEW_LISTING", score: 88, action: "BUY", price: "0.00234", time: "15 mins ago", status: "PENDING_RISK" },
  { id: 3, pair: "BTC/USDT", type: "MOMENTUM", score: 45, action: "IGNORE", price: "64,230.00", time: "1 hour ago", status: "REJECTED" },
  { id: 4, pair: "ETH/USDT", type: "VOLATILITY", score: 78, action: "SELL", price: "3,450.10", time: "2 hours ago", status: "EXECUTED" },
];

const performanceMetrics = [
  { label: "Total PnL (Paper)", value: "+$4,230.50", trend: "up", percentage: "+12.4%" },
  { label: "Win Rate", value: "68.5%", trend: "up", percentage: "+2.1%" },
  { label: "Active Positions", value: "4", trend: "neutral", percentage: "0%" },
  { label: "Risk Exposure", value: "Low", trend: "down", percentage: "-5%" },
];

function MetricCard({ metric }: { metric: typeof performanceMetrics[0] }) {
  return (
    <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-muted-foreground text-sm font-medium mb-2">{metric.label}</p>
          <h3 className="font-display text-2xl font-bold text-foreground">{metric.value}</h3>
        </div>
        <div className={cn(
          "px-2 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1",
          metric.trend === "up" ? "bg-success/20 text-success border border-success/30" : 
          metric.trend === "down" ? "bg-destructive/20 text-destructive border border-destructive/30" : 
          "bg-secondary text-muted-foreground border border-white/10"
        )}>
          {metric.trend === "up" ? <TrendingUp className="w-3 h-3" /> : 
           metric.trend === "down" ? <TrendingDown className="w-3 h-3" /> : 
           <ArrowRightLeft className="w-3 h-3" />}
          {metric.percentage}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Market Overview</h1>
          <p className="text-muted-foreground">Monitoring 42 assets across 2 exchanges.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-white/10 rounded-lg">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-mono text-muted-foreground">Engine Status:</span>
            <span className="text-sm font-mono text-success font-bold">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, i) => (
          <MetricCard key={i} metric={metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Signals Feed (Takes 2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Live Signal Feed
            </h2>
            <button className="text-sm text-primary hover:text-primary-foreground hover:bg-primary px-3 py-1 rounded-md transition-colors border border-primary/30">
              View All Signals
            </button>
          </div>
          
          <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-sm font-medium text-muted-foreground">Asset</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Strategy</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Score</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentSignals.map((signal) => (
                  <tr key={signal.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-mono font-bold text-foreground">
                      {signal.pair}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium text-muted-foreground">
                        {signal.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-secondary h-1.5 rounded-full max-w-[50px]">
                          <div 
                            className={cn(
                              "h-1.5 rounded-full",
                              signal.score > 80 ? "bg-success" : signal.score > 50 ? "bg-warning" : "bg-destructive"
                            )} 
                            style={{ width: `${signal.score}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">{signal.score}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "font-bold text-sm",
                        signal.action === "BUY" ? "text-success" : 
                        signal.action === "SELL" ? "text-destructive" : 
                        "text-muted-foreground"
                      )}>
                        {signal.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          signal.status === "EXECUTED" ? "bg-success" :
                          signal.status === "PENDING_RISK" ? "bg-warning animate-pulse" :
                          "bg-destructive"
                        )} />
                        <span className="text-muted-foreground">{signal.status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {signal.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health / Quick Alerts (Takes 1/3 width) */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Guardian Alerts
          </h2>
          
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-warning/30 bg-warning/5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning"></div>
              <h4 className="font-bold text-warning mb-1">High Volatility Detected</h4>
              <p className="text-sm text-muted-foreground">Risk controller has temporarily reduced max position size by 20% for SOL/USDT due to abnormal spread.</p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl border border-destructive/30 bg-destructive/5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive"></div>
              <h4 className="font-bold text-destructive mb-1">API Rate Limit Warning</h4>
              <p className="text-sm text-muted-foreground">BTCC adapter approaching rate limit (45/50 req/s). Pausing non-critical syncs.</p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl border border-white/10 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              <h4 className="font-bold text-primary mb-1">New Listing Detected</h4>
              <p className="text-sm text-muted-foreground">Possible new asset 'PEPE2' detected on Bitget streams. Scoring in progress...</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
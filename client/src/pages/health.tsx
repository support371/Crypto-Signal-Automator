import { Activity, Server, Database, Cpu, Wifi, Globe, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const systemLogs = [
  { time: "14:45:02.123", level: "INFO", source: "CoreEngine", msg: "Initialized market data listeners for Bitget." },
  { time: "14:45:03.050", level: "INFO", source: "RiskGuardian", msg: "Loaded global rules. Validating active positions..." },
  { time: "14:46:12.890", level: "WARN", source: "Exchange[BTCC]", msg: "Connection timeout. Attempting reconnect (1/3)." },
  { time: "14:47:00.001", level: "INFO", source: "ExecutionRouter", msg: "Paper trading mode enabled. Live execution bypassed." },
  { time: "14:50:22.450", level: "ERROR", source: "MarketStream", msg: "Dropped 5 websocket frames due to high latency." },
  { time: "14:50:23.100", level: "INFO", source: "MarketStream", msg: "Resynced snapshot for SOL/USDT." },
];

function HealthCard({ title, icon: Icon, status, value, description }: any) {
  return (
    <div className="glass-panel p-6 rounded-xl border border-white/10 flex items-start gap-4">
      <div className={cn(
        "p-3 rounded-lg flex-shrink-0",
        status === "ok" ? "bg-success/20 text-success" : 
        status === "warning" ? "bg-warning/20 text-warning" : 
        "bg-destructive/20 text-destructive"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-foreground flex items-center gap-2">
          {title}
          {status === "ok" && <CheckCircle2 className="w-4 h-4 text-success" />}
          {status !== "ok" && <AlertCircle className="w-4 h-4 text-warning" />}
        </h3>
        <div className="font-mono text-xl mt-1 mb-1">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function Health() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            System Health
          </h1>
          <p className="text-muted-foreground">Real-time metrics for engine components and network adapters.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary border border-white/10 rounded-lg text-sm font-mono text-muted-foreground">
          Uptime: <span className="text-foreground font-bold">14d 02h 45m</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <HealthCard 
          title="Engine CPU" 
          icon={Cpu} 
          status="ok" 
          value="12.4%" 
          description="Avg over last 5 minutes" 
        />
        <HealthCard 
          title="Memory Usage" 
          icon={Server} 
          status="ok" 
          value="1.2 GB" 
          description="Of 4.0 GB allocated limit" 
        />
        <HealthCard 
          title="Database Latency" 
          icon={Database} 
          status="ok" 
          value="4 ms" 
          description="Read/write roundtrip" 
        />
        <HealthCard 
          title="Bitget WS Stream" 
          icon={Wifi} 
          status="ok" 
          value="45 ms" 
          description="Ping / connection stable" 
        />
        <HealthCard 
          title="BTCC REST API" 
          icon={Globe} 
          status="warning" 
          value="Disconnected" 
          description="Adapter not configured" 
        />
      </div>

      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-display font-bold text-foreground">System Event Log</h2>
        <div className="glass-panel rounded-xl border border-white/10 p-4 h-96 overflow-y-auto font-mono text-sm">
          <div className="space-y-2">
            {systemLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-4 p-2 hover:bg-white/5 rounded transition-colors">
                <span className="text-muted-foreground w-24 flex-shrink-0">{log.time}</span>
                <span className={cn(
                  "w-16 flex-shrink-0 font-bold",
                  log.level === "INFO" ? "text-primary" :
                  log.level === "WARN" ? "text-warning" :
                  "text-destructive"
                )}>
                  [{log.level}]
                </span>
                <span className="text-muted-foreground w-32 flex-shrink-0">{log.source}</span>
                <span className={cn(
                  "flex-1",
                  log.level === "ERROR" && "text-destructive"
                )}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
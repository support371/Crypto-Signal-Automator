import { Activity, Server, Database, Cpu, Wifi, Globe, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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

// Map logical names to icons
const getIconForModule = (name: string) => {
  if (name.includes("CPU")) return Cpu;
  if (name.includes("Memory")) return Server;
  if (name.includes("Database")) return Database;
  if (name.includes("Stream")) return Wifi;
  return Globe;
};

export default function Health() {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['/api/system/health'],
    queryFn: api.getHealth,
    refetchInterval: 5000 // Poll every 5s
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            System Health
          </h1>
          <p className="text-muted-foreground">Real-time metrics from the external backend execution environment.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary border border-white/10 rounded-lg text-sm font-mono text-muted-foreground">
          Uptime: <span className="text-foreground font-bold">{healthData?.uptime || "---"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="glass-panel p-6 rounded-xl border border-white/10 h-[104px] animate-pulse"></div>)
        ) : (
          healthData?.modules.map((mod, i) => (
            <HealthCard 
              key={i}
              title={mod.name} 
              icon={getIconForModule(mod.name)} 
              status={mod.status} 
              value={mod.metricValue} 
              description={mod.description} 
            />
          ))
        )}
      </div>

      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-display font-bold text-foreground">System Event Log</h2>
        <div className="glass-panel rounded-xl border border-white/10 p-4 h-96 overflow-y-auto font-mono text-sm">
          {isLoading ? (
             <div className="p-4 text-center text-muted-foreground">Loading system logs...</div>
          ) : (
            <div className="space-y-2">
              {healthData?.logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-2 hover:bg-white/5 rounded transition-colors">
                  <span className="text-muted-foreground w-24 flex-shrink-0">{log.timestamp}</span>
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
                  )}>{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
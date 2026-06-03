import { Wallet, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Positions() {
  const { data: activePositions, isLoading: loadingActive } = useQuery({
    queryKey: ['/api/positions/active'],
    queryFn: api.getActivePositions
  });

  const { data: closedPositions, isLoading: loadingClosed } = useQuery({
    queryKey: ['/api/positions/closed'],
    queryFn: api.getClosedPositions
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" />
            Positions (Simulated)
          </h1>
          <p className="text-muted-foreground">Active and recently closed paper-trading positions managed by the execution router.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          Active Positions
          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs ml-2">
            {activePositions?.length || 0}
          </span>
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {loadingActive ? (
            <div className="glass-panel p-6 rounded-xl border border-white/10 h-32 animate-pulse flex items-center justify-center text-muted-foreground">Loading active positions...</div>
          ) : activePositions?.length === 0 ? (
            <div className="glass-panel p-6 rounded-xl border border-white/10 text-center text-muted-foreground">No active positions.</div>
          ) : (
            activePositions?.map((pos) => (
              <div key={pos.id} className="glass-panel p-6 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      pos.side === "LONG" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                    )}>
                      {pos.side === "LONG" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-lg">{pos.pair}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className={cn(
                          "font-bold",
                          pos.side === "LONG" ? "text-success" : "text-destructive"
                        )}>{pos.side}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pos.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-mono font-bold text-xl",
                      pos.pnl.startsWith("+") ? "text-success" : "text-destructive"
                    )}>
                      {pos.pnl}
                    </div>
                    <div className={cn(
                      "font-mono text-sm",
                      pos.pnlPercent.startsWith("+") ? "text-success" : "text-destructive"
                    )}>
                      {pos.pnlPercent}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-4 bg-black/20 rounded-lg border border-white/5">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Entry Price</div>
                    <div className="font-mono">${pos.entryPrice}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div className="font-mono">${pos.currentPrice}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Position Size</div>
                    <div className="font-mono">{pos.size}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/10">
        <h2 className="text-xl font-display font-bold text-muted-foreground">Recently Closed</h2>
        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-sm font-medium text-muted-foreground">Pair</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Side</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Entry / Close</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Size</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">PnL</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingClosed ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading history...</td></tr>
              ) : (
                closedPositions?.map((pos) => (
                  <tr key={pos.id} className="hover:bg-white/5 transition-colors opacity-70 hover:opacity-100">
                    <td className="p-4 font-mono font-bold text-foreground">
                      {pos.pair}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "text-xs font-bold",
                        pos.side === "LONG" ? "text-success" : "text-destructive"
                      )}>
                        {pos.side}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm">
                      ${pos.entryPrice} <span className="text-muted-foreground mx-1">→</span> ${pos.closePrice}
                    </td>
                    <td className="p-4 font-mono text-sm">
                      {pos.size}
                    </td>
                    <td className={cn(
                      "p-4 font-mono text-sm font-bold",
                      pos.pnl.startsWith("+") ? "text-success" : "text-destructive"
                    )}>
                      {pos.pnl} ({pos.pnlPercent})
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium",
                        pos.status === "TAKE_PROFIT" ? "bg-success/20 text-success border border-success/30" : 
                        "bg-destructive/20 text-destructive border border-destructive/30"
                      )}>
                        {pos.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
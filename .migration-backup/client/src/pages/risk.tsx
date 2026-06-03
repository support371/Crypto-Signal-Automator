import { ShieldAlert, AlertTriangle, CheckCircle2, SlidersHorizontal, Info } from "lucide-react";

export default function RiskGuardian() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Risk Guardian
          </h1>
          <p className="text-muted-foreground">Hard-coded limits and safety rails for the automated trading engine.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-lg text-success text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          All Checks Passing
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Global Limits */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            Global Exposure Limits
          </h2>
          
          <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-6">
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Max Total Exposure</label>
                <span className="font-mono text-muted-foreground">$10,000</span>
              </div>
              <div className="flex items-center gap-4">
                <input type="range" className="flex-1 accent-primary" defaultValue={50} />
                <span className="w-16 text-right font-mono bg-secondary px-2 py-1 rounded text-sm">$5,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Max Position per Asset</label>
                <span className="font-mono text-muted-foreground">20% of Portfolio</span>
              </div>
              <div className="flex items-center gap-4">
                <input type="range" className="flex-1 accent-primary" defaultValue={10} max={50} />
                <span className="w-16 text-right font-mono bg-secondary px-2 py-1 rounded text-sm">10%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Daily Drawdown Limit</label>
                <span className="font-mono text-muted-foreground">Halt trading if hit</span>
              </div>
              <div className="flex items-center gap-4">
                <input type="range" className="flex-1 accent-destructive" defaultValue={5} max={20} />
                <span className="w-16 text-right font-mono bg-destructive/20 text-destructive border border-destructive/30 px-2 py-1 rounded text-sm">-5%</span>
              </div>
            </div>
            
            <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-colors font-medium mt-4">
              Update Global Limits
            </button>
          </div>
        </div>

        {/* Strategy Specific Rules */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Strategy Hard Rules
          </h2>
          
          <div className="space-y-3">
            {/* Rule 1 */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-start gap-4">
              <div className="mt-1">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-secondary text-primary focus:ring-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">New Listing Circuit Breaker</h4>
                <p className="text-xs text-muted-foreground mt-1">Automatically halt trading on new listings if spread exceeds 5% within first 15 minutes.</p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-start gap-4">
              <div className="mt-1">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-secondary text-primary focus:ring-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Momentum Cooldown</h4>
                <p className="text-xs text-muted-foreground mt-1">Prevent re-entry into a specific asset for 1 hour after a Stop Loss is hit on a Momentum strategy.</p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-start gap-4">
              <div className="mt-1">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-secondary text-primary focus:ring-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-muted-foreground">Strict Whitelist Only</h4>
                <p className="text-xs text-muted-foreground mt-1">Only allow trading on Top 50 CMC assets regardless of signal strength.</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-warning/10 text-warning border border-warning/20">
                  <Info className="w-3 h-3" /> Currently Disabled
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
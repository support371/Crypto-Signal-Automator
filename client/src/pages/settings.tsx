import { Settings as SettingsIcon, Link2, Shield, EyeOff, Save } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Exchange Settings
          </h1>
          <p className="text-muted-foreground">Manage API keys and connection parameters for supported exchanges.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bitget Settings */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl border border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="px-3 py-1 bg-success/20 text-success text-xs font-mono rounded-full border border-success/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                CONNECTED
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                {/* Mock Bitget Logo */}
                <div className="w-full h-full bg-[#000000] rounded flex items-center justify-center font-bold text-white text-[10px]">
                  Bitget
                </div>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">Bitget Adapter</h2>
                <p className="text-sm text-muted-foreground">Primary exchange for listings & momentum</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" /> API Key
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    defaultValue="bg_live_89123h12k3jb123jh123" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-primary/50 text-muted-foreground"
                    readOnly
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" /> API Secret
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    defaultValue="************************" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-primary/50 text-muted-foreground"
                    readOnly
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Passphrase
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    defaultValue="********" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-primary/50 text-muted-foreground"
                    readOnly
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-white/10">
                <p className="text-xs text-muted-foreground">Last sync: 2s ago</p>
                <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-white/5 border border-white/10 rounded-lg transition-colors text-sm">
                  <Link2 className="w-4 h-4" /> Test Connection
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Binance Settings */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl border border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="px-3 py-1 bg-success/20 text-success text-xs font-mono rounded-full border border-success/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                CONNECTED
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#FCD535] rounded-lg flex items-center justify-center p-1">
                {/* Mock Binance Logo */}
                <div className="font-bold text-[#1E2329] text-[10px]">
                  Binance
                </div>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">Binance Adapter</h2>
                <p className="text-sm text-muted-foreground">Primary high-volume exchange</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" /> API Key
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    defaultValue="bin_live_k3jb123jh12389123h12" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-primary/50 text-muted-foreground"
                    readOnly
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" /> API Secret
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    defaultValue="************************" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-primary/50 text-muted-foreground"
                    readOnly
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-white/10">
                <p className="text-xs text-muted-foreground">Last sync: 1s ago</p>
                <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-white/5 border border-white/10 rounded-lg transition-colors text-sm">
                  <Link2 className="w-4 h-4" /> Test Connection
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BTCC Settings */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <div className="absolute top-0 right-0 p-4">
              <span className="px-3 py-1 bg-secondary text-muted-foreground text-xs font-mono rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                DISCONNECTED
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                {/* Mock BTCC Logo */}
                <div className="w-full h-full bg-[#1A1A1A] rounded flex items-center justify-center font-bold text-white text-[10px] border border-gray-800">
                  BTCC
                </div>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-muted-foreground">BTCC Adapter</h2>
                <p className="text-sm text-muted-foreground">Secondary fallback exchange</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">API Key (Placeholder)</label>
                <input 
                  type="text" 
                  placeholder="Enter BTCC API Key" 
                  className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">API Secret (Placeholder)</label>
                <input 
                  type="password" 
                  placeholder="Enter BTCC API Secret" 
                  className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 rounded-lg transition-colors text-sm font-medium">
                  <Save className="w-4 h-4" /> Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
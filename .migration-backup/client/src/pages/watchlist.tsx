import { Star, TrendingUp, TrendingDown, RefreshCw, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Watchlist() {
  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['/api/watchlist'],
    queryFn: api.getWatchlist
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <Star className="w-8 h-8 text-primary" />
            Watchlist
          </h1>
          <p className="text-muted-foreground">Assets currently monitored by the external engine.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Force Sync
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-sm font-medium text-muted-foreground">Asset Pair</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">Exchange</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">Price</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">24h Change</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">Volume</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">Opportunity Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading watchlist from external backend...</td></tr>
            ) : (
              watchlist?.map((asset, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-mono font-bold text-foreground">
                    {asset.pair}
                  </td>
                  <td className="p-4 text-sm">
                    {asset.exchange}
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium",
                      asset.status === "New Listing" ? "bg-primary/20 text-primary border border-primary/30" : 
                      asset.status === "Active" ? "bg-success/20 text-success border border-success/30" :
                      "bg-secondary text-muted-foreground border border-white/10"
                    )}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm">
                    ${asset.price}
                  </td>
                  <td className={cn(
                    "p-4 font-mono text-sm flex items-center gap-1",
                    asset.trend === "up" ? "text-success" : "text-destructive"
                  )}>
                    {asset.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {asset.change24h}
                  </td>
                  <td className="p-4 font-mono text-sm text-muted-foreground">
                    {asset.volume}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-secondary h-1.5 rounded-full max-w-[100px]">
                        <div 
                          className={cn(
                            "h-1.5 rounded-full",
                            asset.score > 80 ? "bg-success" : asset.score > 50 ? "bg-warning" : "bg-destructive"
                          )} 
                          style={{ width: `${asset.score}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs">{asset.score}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
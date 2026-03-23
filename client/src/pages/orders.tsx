import { History, Search, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Orders() {
  const { data: orderHistory, isLoading } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: api.getOrders
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Order History
          </h1>
          <p className="text-muted-foreground">Complete audit log of all trade executions and attempts from the external router.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search pairs, IDs..." 
              className="pl-9 pr-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-sm font-medium text-muted-foreground">Order ID</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">Time</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">Pair / Exchange</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">Type / Side</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">Price</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">Amount / Total</th>
              <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading order history...</td></tr>
            ) : orderHistory?.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found.</td></tr>
            ) : (
              orderHistory?.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-mono text-sm text-muted-foreground">
                    {order.id}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {order.timestamp}
                  </td>
                  <td className="p-4">
                    <div className="font-mono font-bold text-foreground">{order.pair}</div>
                    <div className="text-xs text-muted-foreground">{order.exchange}</div>
                  </td>
                  <td className="p-4">
                    <div className={cn(
                      "text-sm font-bold",
                      order.side === "BUY" ? "text-success" : "text-destructive"
                    )}>{order.side}</div>
                    <div className="text-xs text-muted-foreground">{order.type}</div>
                  </td>
                  <td className="p-4 font-mono text-sm">
                    ${order.price}
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-sm">{order.amount}</div>
                    <div className="text-xs text-muted-foreground font-mono">{order.total}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium border",
                        order.status === "FILLED" ? "bg-success/10 text-success border-success/30" : 
                        order.status === "CANCELED" ? "bg-secondary text-muted-foreground border-white/10" :
                        "bg-destructive/10 text-destructive border-destructive/30"
                      )}>
                        {order.status}
                      </span>
                      {order.note && (
                        <span className="text-xs text-destructive">{order.note}</span>
                      )}
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
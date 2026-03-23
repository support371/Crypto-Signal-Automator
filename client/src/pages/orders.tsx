import { History, Search, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const orderHistory = [
  { id: "ORD-9821", pair: "SOL/USDT", side: "BUY", type: "MARKET", price: "140.50", amount: "15.5", total: "$2,177.75", status: "FILLED", time: "2026-03-23 14:32:11", exchange: "Bitget" },
  { id: "ORD-9820", pair: "MEME/USDT", side: "BUY", type: "LIMIT", price: "0.00210", amount: "150000", total: "$315.00", status: "FILLED", time: "2026-03-23 14:15:00", exchange: "Bitget" },
  { id: "ORD-9819", pair: "ETH/USDT", side: "SELL", type: "MARKET", price: "3500.00", amount: "2.5", total: "$8,750.00", status: "FILLED", time: "2026-03-23 13:45:22", exchange: "BTCC" },
  { id: "ORD-9818", pair: "BTC/USDT", side: "SELL", type: "STOP_LIMIT", price: "64200.00", amount: "0.1", total: "$6,420.00", status: "FILLED", time: "2026-03-22 09:12:45", exchange: "Bitget" },
  { id: "ORD-9817", pair: "AVAX/USDT", side: "BUY", type: "LIMIT", price: "32.00", amount: "50", total: "$1,600.00", status: "CANCELED", time: "2026-03-22 08:30:00", exchange: "BTCC" },
  { id: "ORD-9816", pair: "DOGE/USDT", side: "BUY", type: "MARKET", price: "0.15", amount: "10000", total: "$1,500.00", status: "FAILED", time: "2026-03-21 16:45:12", exchange: "Bitget", note: "Insufficient balance" },
];

export default function Orders() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Order History
          </h1>
          <p className="text-muted-foreground">Complete audit log of all trade executions and attempts.</p>
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
            {orderHistory.map((order) => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4 font-mono text-sm text-muted-foreground">
                  {order.id}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {order.time}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
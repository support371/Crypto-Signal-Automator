// Common types expected from the external backend API

export type SignalType = 'MOMENTUM' | 'NEW_LISTING' | 'VOLATILITY';
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LIMIT';
export type OrderStatus = 'PENDING_RISK' | 'EXECUTED' | 'REJECTED' | 'FILLED' | 'CANCELED' | 'FAILED';

export interface Signal {
  id: string;
  pair: string;
  type: SignalType;
  score: number;
  action: 'BUY' | 'SELL' | 'IGNORE';
  price: string;
  timestamp: string;
  status: OrderStatus;
  exchange: 'Bitget' | 'BTCC' | 'Binance';
}

export interface Metric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  percentage: string;
}

export interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
}

export interface Position {
  id: string;
  pair: string;
  side: 'LONG' | 'SHORT';
  entryPrice: string;
  currentPrice: string;
  size: string;
  pnl: string;
  pnlPercent: string;
  duration: string;
  status?: 'TAKE_PROFIT' | 'STOP_LOSS'; // For closed positions
  closePrice?: string; // For closed positions
}

export interface Order {
  id: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  price: string;
  amount: string;
  total: string;
  status: OrderStatus;
  timestamp: string;
  exchange: string;
  note?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  source: string;
  message: string;
}

export interface ModuleHealth {
  name: string;
  status: 'ok' | 'warning' | 'error';
  metricValue: string;
  description: string;
}

import { createAdminClient } from './supabase-admin';
import { TradingError } from '../trading/errors';

export interface InstrumentRow {
  symbol: string;
  venue: string;
  base: string;
  quote: string;
  qty_precision: number;
  active: boolean;
}

export async function loadInstrument(symbol: string): Promise<InstrumentRow> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('instruments')
    .select('symbol, venue, base, quote, qty_precision, active')
    .eq('symbol', symbol)
    .single();

  if (error || !data) throw new TradingError(`instrumento desconhecido: ${symbol}`);
  if (!data.active) throw new TradingError(`instrumento inativo: ${symbol}`);

  return data as InstrumentRow;
}

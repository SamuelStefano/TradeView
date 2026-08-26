-- Tradable universe for the paper engine. Symbols use CCXT's unified form so
-- the same string addresses the exchange without a translation table.
--
-- Venue choice is constrained by what actually answers from a datacenter IP:
-- Binance returns 451 and Mercado Bitcoin 403 from both this host and Vercel.
-- Foxbit covers BRL and OKX covers USDT, and every row below was confirmed
-- against a live order book.

insert into tradeview.instruments (symbol, venue, asset_class, base, quote, price_precision, qty_precision) values
  ('BTC/BRL', 'foxbit', 'cripto', 'BTC', 'BRL', 2, 8),
  ('ETH/BRL', 'foxbit', 'cripto', 'ETH', 'BRL', 2, 8),
  ('SOL/BRL', 'foxbit', 'cripto', 'SOL', 'BRL', 2, 8),
  ('USDT/BRL', 'foxbit', 'câmbio', 'USDT', 'BRL', 2, 8),
  ('USDC/BRL', 'foxbit', 'câmbio', 'USDC', 'BRL', 2, 8),
  ('XRP/BRL', 'foxbit', 'cripto', 'XRP', 'BRL', 2, 6),
  ('ADA/BRL', 'foxbit', 'cripto', 'ADA', 'BRL', 2, 8),
  ('DOGE/BRL', 'foxbit', 'cripto', 'DOGE', 'BRL', 2, 8),
  ('AVAX/BRL', 'foxbit', 'cripto', 'AVAX', 'BRL', 2, 8),
  ('LINK/BRL', 'foxbit', 'cripto', 'LINK', 'BRL', 2, 8),
  ('LTC/BRL', 'foxbit', 'cripto', 'LTC', 'BRL', 2, 8),
  ('DOT/BRL', 'foxbit', 'cripto', 'DOT', 'BRL', 2, 8),
  ('BTC/USDT', 'okx', 'cripto', 'BTC', 'USDT', 1, 8),
  ('ETH/USDT', 'okx', 'cripto', 'ETH', 'USDT', 2, 6),
  ('SOL/USDT', 'okx', 'cripto', 'SOL', 'USDT', 2, 6),
  ('XRP/USDT', 'okx', 'cripto', 'XRP', 'USDT', 4, 6),
  ('ADA/USDT', 'okx', 'cripto', 'ADA', 'USDT', 4, 4),
  ('DOGE/USDT', 'okx', 'cripto', 'DOGE', 'USDT', 5, 6),
  ('AVAX/USDT', 'okx', 'cripto', 'AVAX', 'USDT', 3, 6),
  ('LINK/USDT', 'okx', 'cripto', 'LINK', 'USDT', 3, 6),
  ('LTC/USDT', 'okx', 'cripto', 'LTC', 'USDT', 2, 6),
  ('DOT/USDT', 'okx', 'cripto', 'DOT', 'USDT', 4, 6),
  ('TRX/USDT', 'okx', 'cripto', 'TRX', 'USDT', 5, 6)
on conflict (symbol) do nothing;

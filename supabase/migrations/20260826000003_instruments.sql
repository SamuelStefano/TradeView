-- Tradable universe for the paper engine. Symbols use CCXT's unified form so
-- the same string addresses the exchange without a translation table.

insert into instruments (symbol, venue, asset_class, base, quote, price_precision, qty_precision) values
  ('BTC/USDT',  'binance', 'cripto',      'BTC',  'USDT', 2,  6),
  ('ETH/USDT',  'binance', 'cripto',      'ETH',  'USDT', 2,  5),
  ('SOL/USDT',  'binance', 'cripto',      'SOL',  'USDT', 3,  3),
  ('BNB/USDT',  'binance', 'cripto',      'BNB',  'USDT', 2,  4),
  ('XRP/USDT',  'binance', 'cripto',      'XRP',  'USDT', 4,  1),
  ('ADA/USDT',  'binance', 'cripto',      'ADA',  'USDT', 4,  1),
  ('DOGE/USDT', 'binance', 'cripto',      'DOGE', 'USDT', 5,  0),
  ('AVAX/USDT', 'binance', 'cripto',      'AVAX', 'USDT', 3,  2),
  ('LINK/USDT', 'binance', 'cripto',      'LINK', 'USDT', 3,  2),
  ('MATIC/USDT','binance', 'cripto',      'MATIC','USDT', 4,  1),
  ('BTC/BRL',   'mercadobitcoin', 'cripto', 'BTC', 'BRL', 0,  8),
  ('ETH/BRL',   'mercadobitcoin', 'cripto', 'ETH', 'BRL', 0,  6),
  ('SOL/BRL',   'mercadobitcoin', 'cripto', 'SOL', 'BRL', 2,  4),
  ('USDT/BRL',  'mercadobitcoin', 'cambio', 'USDT','BRL', 4,  2)
on conflict (symbol) do nothing;

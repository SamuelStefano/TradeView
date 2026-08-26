-- asset_class is free text and was seeded unaccented, while the TypeScript
-- AssetClass union spells it 'câmbio'. The two have to be byte-identical: the
-- display catalogue in lib/markets/catalogue.ts is checked against the seed by
-- catalogue.test.ts, and a mismatch there means a symbol renders under a class
-- the UI does not know about.
update tradeview.instruments set asset_class = 'câmbio' where asset_class = 'cambio';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MODELS, OPTIONS } from '../utils/products';
import { pricesApi } from '../utils/api';

// Copie locale des prix partagés, utilisée si le serveur est injoignable
const CACHE_KEY = 'mh_prices_shared_v2';
const PricesContext = createContext(null);

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
  catch { return {}; }
}
function writeCache(v) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(v)); } catch { /* stockage indisponible */ }
}

export function PricesProvider({ children }) {
  const [ov, setOv]         = useState(loadCache);
  const [synced, setSynced] = useState(false);

  const refresh = useCallback(() =>
    pricesApi.get()
      .then(r => { setOv(r.data || {}); writeCache(r.data || {}); setSynced(true); })
      .catch(() => setSynced(false)),
  []);
  useEffect(() => { refresh(); }, [refresh]);

  /* ── getters ── */
  const getModelPrice = useCallback((id) =>
    ov.models?.[id]?.price ?? MODELS.find(m => m.id === id)?.price ?? 0,
  [ov]);

  const getModelTransport = useCallback((id) =>
    ov.models?.[id]?.transport ?? MODELS.find(m => m.id === id)?.transport ?? 0,
  [ov]);

  const getOptionPrice = useCallback((optId, modelId) => {
    const opt = OPTIONS.find(o => o.id === optId);
    if (!opt) return 0;
    if (opt.pricesByModel) return ov.varOptions?.[optId]?.[modelId] ?? opt.pricesByModel[modelId] ?? 0;
    return ov.options?.[optId] ?? opt.price ?? 0;
  }, [ov]);

  /* ── enregistrement (partagé entre tous les appareils) ── */
  const saveOverrides = useCallback(async (next) => {
    const { data } = await pricesApi.save(next);
    setOv(data);
    writeCache(data);
    setSynced(true);
  }, []);

  const priceFns = { getModelPrice, getModelTransport, getOptionPrice };

  return (
    <PricesContext.Provider value={{ priceFns, getModelPrice, getModelTransport, getOptionPrice, overrides: ov, saveOverrides, refresh, synced }}>
      {children}
    </PricesContext.Provider>
  );
}

export function usePrices() { return useContext(PricesContext); }

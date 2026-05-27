import React, { createContext, useContext, useState, useCallback } from 'react';
import { MODELS, OPTIONS, getDefaultOptionPrice } from '../utils/products';

const STORAGE_KEY = 'mh_prices_v1';
const PricesContext = createContext(null);

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

export function PricesProvider({ children }) {
  const [ov, setOv] = useState(load);

  const save = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setOv(next);
  }, []);

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
    if (opt.pricesByModel) {
      // option à prix variable par modèle
      return ov.varOptions?.[optId]?.[modelId] ?? opt.pricesByModel[modelId] ?? 0;
    }
    return ov.options?.[optId] ?? opt.price ?? 0;
  }, [ov]);

  /* ── setters ── */
  const updateModelPrice = useCallback((modelId, field, value) =>
    save({ ...ov, models: { ...ov.models, [modelId]: { ...(ov.models?.[modelId] || {}), [field]: Number(value) } } }),
  [ov, save]);

  const updateOptionPrice = useCallback((optId, value, modelId = null) => {
    if (modelId) {
      save({ ...ov, varOptions: { ...ov.varOptions, [optId]: { ...(ov.varOptions?.[optId] || {}), [modelId]: Number(value) } } });
    } else {
      save({ ...ov, options: { ...ov.options, [optId]: Number(value) } });
    }
  }, [ov, save]);

  const resetAll = useCallback(() => { localStorage.removeItem(STORAGE_KEY); setOv({}); }, []);

  /* objet passé à calculateTotals */
  const priceFns = { getModelPrice, getModelTransport, getOptionPrice };

  return (
    <PricesContext.Provider value={{ priceFns, getModelPrice, getModelTransport, getOptionPrice, updateModelPrice, updateOptionPrice, resetAll }}>
      {children}
    </PricesContext.Provider>
  );
}

export function usePrices() { return useContext(PricesContext); }

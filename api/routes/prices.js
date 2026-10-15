const express = require('express');
const { readPrices, writePrices } = require('../utils/pricesStore');

const router = express.Router();

const isNum = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;

function sanitize(body) {
  const out = { models: {}, options: {}, varOptions: {} };
  for (const [id, m] of Object.entries(body?.models || {})) {
    const e = {};
    if (isNum(m?.price)) e.price = m.price;
    if (isNum(m?.transport)) e.transport = m.transport;
    if (Object.keys(e).length) out.models[id] = e;
  }
  for (const [id, v] of Object.entries(body?.options || {})) {
    if (isNum(v)) out.options[id] = v;
  }
  for (const [id, byModel] of Object.entries(body?.varOptions || {})) {
    const e = {};
    for (const [mid, v] of Object.entries(byModel || {})) if (isNum(v)) e[mid] = v;
    if (Object.keys(e).length) out.varOptions[id] = e;
  }
  return out;
}

router.get('/', async (_req, res) => {
  try {
    res.json(await readPrices());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const prices = sanitize(req.body);
    await writePrices(prices);
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

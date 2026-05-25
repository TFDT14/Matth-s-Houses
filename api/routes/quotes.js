const express = require('express');
const router = express.Router();
const { getNextQuoteNumber, createQuote, getQuotes, updateQuoteStatus } = require('../utils/notionClient');

router.get('/next-number', async (req, res) => {
  try {
    const number = await getNextQuoteNumber();
    res.json({ number });
  } catch (err) {
    console.error('next-number error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { statut, modele } = req.query;
    const quotes = await getQuotes({ statut, modele });
    res.json({ quotes });
  } catch (err) {
    console.error('get quotes error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const page = await createQuote(req.body);
    res.json({ success: true, id: page.id });
  } catch (err) {
    console.error('create quote error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { statut } = req.body;
    await updateQuoteStatus(req.params.id, statut);
    res.json({ success: true });
  } catch (err) {
    console.error('update status error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function getNextQuoteNumber() {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    sorts: [{ property: 'Numéro Devis', direction: 'descending' }],
    page_size: 1,
  });

  if (response.results.length === 0) return 'MH-001';

  const last = response.results[0];
  const lastNum = last.properties['Numéro Devis']?.rich_text?.[0]?.text?.content || 'MH-000';
  const num = parseInt(lastNum.replace('MH-', ''), 10) + 1;
  return `MH-${String(num).padStart(3, '0')}`;
}

async function createQuote(data) {
  const { clientName, phone, model, options, totalHT, tva, totalTTC, quoteNumber, quoteDate } = data;

  return await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      'Nom Client':    { title: [{ text: { content: clientName } }] },
      'Téléphone':     { phone_number: phone || null },
      'Modèle':        { select: { name: model } },
      'Options':       { rich_text: [{ text: { content: options || '' } }] },
      'Total HT':      { number: totalHT },
      'TVA':           { number: tva },
      'Total TTC':     { number: totalTTC },
      'Numéro Devis':  { rich_text: [{ text: { content: quoteNumber } }] },
      'Date Devis':    { date: { start: quoteDate } },
      'Statut':        { select: { name: 'En attente' } },
    },
  });
}

async function getQuotes(filter = {}) {
  const filters = [];

  if (filter.statut) {
    filters.push({ property: 'Statut', select: { equals: filter.statut } });
  }
  if (filter.modele) {
    filters.push({ property: 'Modèle', select: { equals: filter.modele } });
  }

  const queryParams = {
    database_id: DATABASE_ID,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  };

  if (filters.length === 1) queryParams.filter = filters[0];
  else if (filters.length > 1) queryParams.filter = { and: filters };

  const response = await notion.databases.query(queryParams);
  return response.results.map(formatQuote);
}

async function updateQuoteStatus(pageId, statut) {
  return await notion.pages.update({
    page_id: pageId,
    properties: {
      'Statut': { select: { name: statut } },
    },
  });
}

function formatQuote(page) {
  const p = page.properties;
  return {
    id: page.id,
    clientName: p['Nom Client']?.title?.[0]?.text?.content || '',
    phone:       p['Téléphone']?.phone_number || '',
    model:       p['Modèle']?.select?.name || '',
    options:     p['Options']?.rich_text?.[0]?.text?.content || '',
    totalHT:     p['Total HT']?.number || 0,
    tva:         p['TVA']?.number || 0,
    totalTTC:    p['Total TTC']?.number || 0,
    quoteNumber: p['Numéro Devis']?.rich_text?.[0]?.text?.content || '',
    quoteDate:   p['Date Devis']?.date?.start || '',
    statut:      p['Statut']?.select?.name || 'En attente',
    createdAt:   page.created_time,
    updatedAt:   page.last_edited_time,
  };
}

async function deleteQuote(pageId) {
  return await notion.pages.update({
    page_id: pageId,
    archived: true,
  });
}

module.exports = { getNextQuoteNumber, createQuote, getQuotes, updateQuoteStatus, deleteQuote };

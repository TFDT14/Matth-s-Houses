const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Page Notion « Prix de l'application », sous la page Matth's Houses
const PAGE_ID = '3f976b54-c4f4-8185-add4-c515aeb6223a';
const CHUNK = 1900;

async function getCodeBlock() {
  const { results } = await notion.blocks.children.list({ block_id: PAGE_ID, page_size: 50 });
  return results.find(b => b.type === 'code');
}

async function readPrices() {
  const block = await getCodeBlock();
  if (!block) return {};
  const text = block.code.rich_text.map(t => t.plain_text).join('');
  try { return JSON.parse(text || '{}'); } catch { return {}; }
}

async function writePrices(prices) {
  const json = JSON.stringify(prices);
  const rich_text = [];
  for (let i = 0; i < json.length; i += CHUNK) rich_text.push({ text: { content: json.slice(i, i + CHUNK) } });
  if (!rich_text.length) rich_text.push({ text: { content: '{}' } });

  const block = await getCodeBlock();
  if (block) {
    await notion.blocks.update({ block_id: block.id, code: { language: 'json', rich_text } });
  } else {
    await notion.blocks.children.append({ block_id: PAGE_ID, children: [{ code: { language: 'json', rich_text } }] });
  }
}

module.exports = { readPrices, writePrices };

// src/worker.js
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();
app.use('/*', cors());

app.get('/entries', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM entries ORDER BY id ASC'
  ).all();
  return c.json(results);
});

app.post('/entries', async (c) => {
  const { month, day, amount, currency, category, concept, recurring } = await c.req.json();
  if (!month || !day || amount == null || !currency || !category) {
    return c.json({ error: 'Missing required fields' }, 400);
  }
  const stmt = await c.env.DB.prepare(
    `INSERT INTO entries (month, day, amount, currency, category, concept, recurring)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(month, day, amount, currency, category, concept || '', recurring ? 1 : 0).run();
  return c.json({ id: stmt.meta.last_row_id }, 201);
});

app.delete('/entries/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM entries WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default app;

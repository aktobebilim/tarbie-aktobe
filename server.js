const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

pool.query(`
  CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    category VARCHAR(100),
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error("DB Init Error:", err));

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materials ORDER BY id DESC');
    res.render('index', { materials: result.rows });
  } catch (err) {
    console.error(err);
    res.render('index', { materials: [] });
  }
});

app.post('/add', async (req, res) => {
  const { title, category, link } = req.body;
  try {
    await pool.query('INSERT INTO materials (title, category, link) VALUES ($1, $2, $3)', [title, category, link]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send("Қате орын алды");
  }
});

app.listen(PORT, () => {
  console.log(`Сервер жұмыс істеп тұр: http://localhost:${PORT}`);
});

const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM student s WHERE s.class_id = c.id) as students
      FROM class c
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.put('/:id', async (req, res) => {
  const { class_name } = req.body;
  try {
    await db.query('UPDATE class SET class_name = ? WHERE id = ?', [class_name, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM class WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
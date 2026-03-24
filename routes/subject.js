const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, t.name as teacher_name
      FROM subject s
      LEFT JOIN teacher t ON s.teacher_id = t.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.put('/:id', async (req, res) => {
  const { subject_name, teacher_id } = req.body;
  try {
    await db.query('UPDATE subject SET subject_name = ?, teacher_id = ? WHERE id = ?', [subject_name, teacher_id || null, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM subject WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
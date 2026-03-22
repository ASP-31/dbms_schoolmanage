const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.id
    `);
    
    const mappedRows = rows.map(r => ({
      ...r,
      attended_date: r.attended_date ? new Date(r.attended_date.getTime() - r.attended_date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : null
    }));
    
    res.json(mappedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;

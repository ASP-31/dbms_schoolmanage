const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, 
        (SELECT COUNT(*) FROM courses c WHERE c.department_id = d.id) as courses,
        (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id) as students
      FROM departments d
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;

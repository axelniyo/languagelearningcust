import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// GET /api/phrases - Get all phrases or filter by lesson_id
router.get('/', async (req, res) => {
  try {
    const { lesson_id } = req.query;
    let query = `
      SELECT 
        p.id,
        p.lesson_id,
        p.phrase,
        p.translation,
        p.pronunciation,
        p.context,
        p.difficulty_level,
        p.order_index,
        l.name as lesson_name
      FROM phrases p
      LEFT JOIN lessons l ON p.lesson_id = l.id
    `;
    const params = [];
    
    if (lesson_id) {
      query += ' WHERE p.lesson_id = ?';
      params.push(lesson_id);
    }
    
    query += ' ORDER BY p.order_index, p.phrase';
    
    const [rows] = await pool.query(query, params);
    console.log(`Found ${rows.length} phrases`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching phrases:', error);
    res.status(500).json({ 
      error: 'Failed to fetch phrases',
      message: error.message 
    });
  }
});

// POST /api/phrases - Add a new phrase
router.post('/', async (req, res) => {
  try {
    const { lesson_id, phrase, translation, pronunciation, context, difficulty_level, order_index } = req.body;
    console.log('API: Adding new phrase:', { lesson_id, phrase, translation, context });
    
    // Validate required fields
    if (!phrase || !translation) {
      return res.status(400).json({ 
        error: 'Phrase and translation are required fields' 
      });
    }
    
    // Insert new phrase
    const query = `
      INSERT INTO phrases (lesson_id, phrase, translation, pronunciation, context, difficulty_level, order_index) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [lesson_id || null, phrase, translation, pronunciation || '', context || '', difficulty_level || 'beginner', order_index || 0];
    
    const [result] = await pool.query(query, params);
    
    console.log('✅ Phrase added successfully with ID:', result.insertId);
    
    res.status(201).json({
      success: true,
      message: 'Phrase added successfully',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error adding phrase:', error);
    res.status(500).json({
      error: 'Failed to add phrase',
      message: error.message
    });
  }
});

export default router;
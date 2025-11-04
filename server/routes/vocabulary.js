import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// GET /api/vocabulary - Get all vocabulary items
router.get('/', async (req, res) => {
  try {
    const { lesson_id } = req.query;
    let query = 'SELECT * FROM vocabulary';
    const params = [];
    
    if (lesson_id) {
      query += ' WHERE lesson_id = ?';
      params.push(lesson_id);
    }
    
    query += ' ORDER BY word';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vocabulary',
      message: error.message 
    });
  }
});

// POST /api/vocabulary - Add a new vocabulary item
router.post('/', async (req, res) => {
  try {
    const { lesson_id, word, translation, pronunciation, example_sentence, example_translation, word_type, difficulty_level, order_index } = req.body;
    console.log('API: Adding new vocabulary item:', { lesson_id, word, translation, word_type });
    
    // Validate required fields
    if (!word || !translation) {
      return res.status(400).json({ 
        error: 'Word and translation are required fields' 
      });
    }

    // Insert new vocabulary item
    const query = 'INSERT INTO vocabulary (lesson_id, word, translation, pronunciation, example_sentence, example_translation, word_type, difficulty_level, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [lesson_id || null, word, translation, pronunciation || '', example_sentence || '', example_translation || '', word_type || 'noun', difficulty_level || 'beginner', order_index || 0];
    const [result] = await pool.query(query, params);

    console.log('✅ Vocabulary item added successfully with ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Vocabulary item added successfully',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error adding vocabulary item:', error);
    res.status(500).json({
      error: 'Failed to add vocabulary item',
      message: error.message
    });
  }
});

export default router;
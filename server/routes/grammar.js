import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// GET /api/grammar - Get all grammar rules or filter by lesson_id
router.get('/', async (req, res) => {
  try {
    const { lesson_id } = req.query;
    let query = `
      SELECT 
        g.id,
        g.lesson_id,
        g.title,
        g.explanation,
        g.examples,
        g.difficulty_level,
        g.order_index,
        l.name as lesson_name
      FROM grammar_rules g
      LEFT JOIN lessons l ON g.lesson_id = l.id
    `;
    const params = [];
    
    if (lesson_id) {
      query += ' WHERE g.lesson_id = ?';
      params.push(lesson_id);
    }
    
    query += ' ORDER BY g.order_index, g.title';
    
    const [rows] = await pool.query(query, params);
    console.log(`Found ${rows.length} grammar rules`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching grammar rules:', error);
    res.status(500).json({ 
      error: 'Failed to fetch grammar rules',
      message: error.message 
    });
  }
});

// POST /api/grammar - Add a new grammar rule
router.post('/', async (req, res) => {
  try {
    const { lesson_id, title, explanation, examples, difficulty_level, order_index } = req.body;
    console.log('API: Adding new grammar rule:', { lesson_id, title, explanation });
    
    // Validate required fields
    if (!title || !explanation) {
      return res.status(400).json({ 
        error: 'Title and explanation are required fields' 
      });
    }
    
    // Insert new grammar rule
    const query = `
      INSERT INTO grammar_rules (lesson_id, title, explanation, examples, difficulty_level, order_index) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [lesson_id || null, title, explanation, JSON.stringify(examples || []), difficulty_level || 'beginner', order_index || 0];
    
    const [result] = await pool.query(query, params);
    
    console.log('✅ Grammar rule added successfully with ID:', result.insertId);
    
    res.status(201).json({
      success: true,
      message: 'Grammar rule added successfully',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error adding grammar rule:', error);
    res.status(500).json({
      error: 'Failed to add grammar rule',
      message: error.message
    });
  }
});

export default router;
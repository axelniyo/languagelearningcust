import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// GET /api/exercises - Get all exercises or filter by lesson_id
router.get('/', async (req, res) => {
  try {
    const { lesson_id } = req.query;
    let query = `
      SELECT 
        e.id,
        e.lesson_id,
        e.question,
        e.exercise_type,
        e.options,
        e.correct_answer,
        e.difficulty_level,
        e.points,
        e.order_index,
        l.name as lesson_name
      FROM exercises e
      LEFT JOIN lessons l ON e.lesson_id = l.id
    `;
    const params = [];
    
    if (lesson_id) {
      query += ' WHERE e.lesson_id = ?';
      params.push(lesson_id);
    }
    
    query += ' ORDER BY e.order_index, e.question';
    
    const [rows] = await pool.query(query, params);
    console.log(`Found ${rows.length} exercises`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ 
      error: 'Failed to fetch exercises',
      message: error.message 
    });
  }
});

// POST /api/exercises - Add a new exercise
router.post('/', async (req, res) => {
  try {
    const { lesson_id, question, exercise_type, options, correct_answer, difficulty_level, points, hints, explanation, order_index } = req.body;
    console.log('API: Adding new exercise:', { lesson_id, question, exercise_type, correct_answer });
    
    // Validate required fields
    if (!question || !exercise_type || !correct_answer) {
      return res.status(400).json({ 
        error: 'Question, exercise_type, and correct_answer are required fields' 
      });
    }
    
    // Insert new exercise
    const query = `
      INSERT INTO exercises (lesson_id, question, exercise_type, options, correct_answer, difficulty_level, points, hints, explanation, order_index) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [lesson_id || null, question, exercise_type, JSON.stringify(options || []), correct_answer, difficulty_level || 'beginner', points || 10, JSON.stringify(hints || []), explanation || '', order_index || 0];
    
    const [result] = await pool.query(query, params);
    
    console.log('✅ Exercise added successfully with ID:', result.insertId);
    
    res.status(201).json({
      success: true,
      message: 'Exercise added successfully',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({
      error: 'Failed to add exercise',
      message: error.message
    });
  }
});

export default router;
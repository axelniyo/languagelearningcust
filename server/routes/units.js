import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// GET /api/courses/:courseId/units - Get units for a course with lessons
router.get('/:courseId/units', async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log('API: Fetching units for course:', courseId);
    
    // Get units
    const [unitRows] = await pool.query(`
      SELECT id, name, description, order_index, xp_reward, created_at
      FROM units 
      WHERE course_id = ?
      ORDER BY order_index
    `, [courseId]);
    
    if (unitRows.length === 0) {
      console.log('No units found for course:', courseId);
      return res.json([]);
    }
    
    // Get lessons for each unit
    const unitsWithLessons = await Promise.all(unitRows.map(async (unit) => {
      const [lessons] = await pool.query(
        'SELECT id, name, description, order_index, xp_reward, created_at FROM lessons WHERE unit_id = ? ORDER BY order_index',
        [unit.id]
      );
      return { ...unit, lessons };
    }));
    
    console.log(`Found ${unitsWithLessons.length} units with lessons`);
    res.json(unitsWithLessons);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ 
      error: 'Failed to fetch units',
      message: error.message 
    });
  }
});

// GET /api/units/:id - Get a single unit by ID with lessons
router.get('/:id', async (req, res) => {
  try {
    const [unitRows] = await pool.query(
      'SELECT * FROM units WHERE id = ?',
      [req.params.id]
    );
    
    if (unitRows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    
    const unit = unitRows[0];
    
    // Get lessons for this unit
    const [lessons] = await pool.query(
      'SELECT * FROM lessons WHERE unit_id = ? ORDER BY order_index',
      [unit.id]
    );
    
    res.json({ ...unit, lessons });
  } catch (error) {
    console.error('Error fetching unit:', error);
    res.status(500).json({ 
      error: 'Failed to fetch unit',
      message: error.message 
    });
  }
});

// POST /api/units - Create a new unit
router.post('/', async (req, res) => {
  const { course_id, name, description, order_index, xp_reward } = req.body;
  
  if (!course_id || !name) {
    return res.status(400).json({ error: 'course_id and name are required' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO units (course_id, name, description, order_index, xp_reward) VALUES (?, ?, ?, ?, ?)',
      [course_id, name, description || null, order_index || 0, xp_reward || 0]
    );
    
    const [newUnit] = await pool.query(
      'SELECT * FROM units WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newUnit[0]);
  } catch (error) {
    console.error('Error creating unit:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        error: 'Invalid course_id' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create unit',
      message: error.message 
    });
  }
});

// PUT /api/units/:id - Update a unit
router.put('/:id', async (req, res) => {
  const { name, description, order_index, xp_reward } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  
  try {
    const [result] = await pool.query(
      'UPDATE units SET name = ?, description = ?, order_index = ?, xp_reward = ? WHERE id = ?',
      [name, description || null, order_index || 0, xp_reward || 0, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    
    const [updatedUnit] = await pool.query(
      'SELECT * FROM units WHERE id = ?',
      [req.params.id]
    );
    
    res.json(updatedUnit[0]);
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ 
      error: 'Failed to update unit',
      message: error.message 
    });
  }
});

// DELETE /api/units/:id - Delete a unit
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM units WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting unit:', error);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        error: 'Cannot delete unit as it contains lessons' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to delete unit',
      message: error.message 
    });
  }
});

export default router;
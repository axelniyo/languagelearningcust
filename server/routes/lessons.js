import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// GET /api/lessons/progress - Get user progress summary
// GET /api/lessons/progress - Get user progress summary
router.get('/progress', async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log('[GET /api/lessons/progress] Fetching progress for user:', userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // First, check if user_progress table has the expected columns
    try {
      const [progressRows] = await pool.query(
        `SELECT 
          user_id,
          total_xp,
          level,
          completed_lessons,
          completed_courses,
          last_lesson_id
        FROM user_progress 
        WHERE user_id = ?`,
        [userId]
      );
      
      if (progressRows.length === 0) {
        console.log(`[GET /api/lessons/progress] No progress found for user ${userId}, returning defaults`);
        return res.json({ 
          userId: parseInt(userId), 
          total_xp: 0, 
          level: 1, 
          completed_lessons: 0,
          completed_courses: 0,
          last_lesson: null
        });
      }

      const progress = progressRows[0];
      
      // Get lesson details if last_lesson_id exists
      let lastLesson = null;
      if (progress.last_lesson_id) {
        const [lessonRows] = await pool.query(
          'SELECT name, xp_reward FROM lessons WHERE id = ?',
          [progress.last_lesson_id]
        );
        if (lessonRows.length > 0) {
          lastLesson = {
            id: progress.last_lesson_id,
            name: lessonRows[0].name,
            xp_reward: lessonRows[0].xp_reward
          };
        }
      }

      console.log(`[GET /api/lessons/progress] Progress found for user ${userId}:`, progress);
      
      res.json({
        userId: progress.user_id,
        total_xp: progress.total_xp || 0,
        level: progress.level || 1,
        completed_lessons: progress.completed_lessons || 0,
        completed_courses: progress.completed_courses || 0,
        last_lesson: lastLesson
      });
      
    } catch (dbError) {
      console.error('[GET /api/lessons/progress] Database error:', dbError);
      
      // Fallback: return basic progress if table structure is different
      const [completedCount] = await pool.query(
        'SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND completed = true',
        [userId]
      );
      
      const [totalXp] = await pool.query(
        'SELECT COALESCE(SUM(score), 0) as total_xp FROM user_progress WHERE user_id = ?',
        [userId]
      );
      
      res.json({
        userId: parseInt(userId),
        total_xp: totalXp[0]?.total_xp || 0,
        level: Math.floor((totalXp[0]?.total_xp || 0) / 100) + 1,
        completed_lessons: completedCount[0]?.count || 0,
        completed_courses: 0, // You might need to calculate this differently
        last_lesson: null
      });
    }
    
  } catch (error) {
    console.error('[GET /api/lessons/progress] General error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// GET /api/lessons/progress/:userId/:courseId - get progress for user+course
router.get('/progress/:userId/:courseId', async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    if (!userId || !courseId) {
      return res.status(400).json({ error: 'userId and courseId are required' });
    }
    // Get all lessons for this course
    const [lessons] = await pool.query(
      `SELECT l.id AS lesson_id, u.id as unit_id
       FROM lessons l
       JOIN units u ON l.unit_id = u.id
       WHERE u.course_id = ?`,
      [courseId]
    );
    if (lessons.length === 0) return res.json({ total:0, completed:0, xp:0 });

    // Get completed user progress for these lessons
    const lessonIds = lessons.map(row => row.lesson_id);
    const placeholders = lessonIds.map(() => '?').join(',');
    const [progressRows] = lessonIds.length
      ? await pool.query(
          `SELECT lesson_id, completed, score FROM user_progress WHERE user_id = ? AND lesson_id IN (${placeholders})`,
          [userId, ...lessonIds]
        )
      : [[]];
    const completed = progressRows.filter(row => row.completed).length;
    const xp = progressRows.reduce((sum, row) => sum + (row.score || 0), 0);

    res.json({ 
      total: lessons.length,
      completed,
      xp
    });
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ error: 'Failed to load progress', message: err.message });
  }
});

// GET /api/lessons/progress/lesson/:userId/:lessonId - get progress for user+lesson
router.get('/progress/lesson/:userId/:lessonId', async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    if (!userId || !lessonId) {
      return res.status(400).json({ error: 'userId and lessonId are required' });
    }
    // Check for user progress for this lesson
    const [rows] = await pool.query(
      `SELECT completed FROM user_progress WHERE user_id = ? AND lesson_id = ?`,
      [userId, lessonId]
    );
    if (!rows.length) {
      return res.json({ completed: false });
    }
    return res.json({ completed: Boolean(rows[0].completed) });
  } catch (err) {
    console.error('Error fetching lesson progress:', err);
    res.status(500).json({ error: 'Failed to load lesson progress', message: err.message });
  }
});

// POST /api/lessons/progress - Mark lesson as completed for user
router.post('/progress', async (req, res) => {
  console.log('[POST /api/lessons/progress] Incoming payload:', req.body);
  try {
    const { userId, lessonId } = req.body;
    if (!userId || !lessonId) {
      console.warn('[POST /api/lessons/progress] Missing userId or lessonId');
      return res.status(400).json({ error: 'userId and lessonId are required' });
    }

    // Upsert user progress (mark completed, set score/Xp to lesson's xp_reward)
    // Try to insert, if duplicate, update
    let [lessonRows] = await pool.query(
      'SELECT xp_reward FROM lessons WHERE id = ?',
      [lessonId]
    );
    if (!lessonRows.length) {
      console.error(`[POST /api/lessons/progress] Lesson ID not found in database: ${lessonId}`);
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const xp = lessonRows[0].xp_reward;

    await pool.query(
      `INSERT INTO user_progress (user_id, lesson_id, completed, score, completed_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE completed = VALUES(completed), score = VALUES(score), completed_at = VALUES(completed_at), updated_at = NOW()`,
      [userId, lessonId, true, xp]
    );
    console.log(`[POST /api/lessons/progress] Progress saved: userId=${userId} lessonId=${lessonId} xp=${xp}`);
    res.json({ success: true });
  } catch (err) {
    console.error('[POST /api/lessons/progress] Error saving progress:', err);
    res.status(500).json({ error: 'Failed to save progress', message: err.message });
  }
});

// GET /api/lessons/:id - Get lesson by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('API: Fetching lesson with ID:', id);
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Get basic lesson info
      const [lessonRows] = await connection.query(
        `SELECT 
          l.id,
          l.name,
          l.description,
          l.lesson_type,
          l.order_index,
          l.xp_reward,
          l.created_at,
          u.name as unit_name,
          c.name as course_name,
          c.id as course_id
        FROM lessons l
        JOIN units u ON l.unit_id = u.id
        JOIN courses c ON u.course_id = c.id
        WHERE l.id = ?`,
        [id]
      );
      
      if (lessonRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Lesson not found' });
      }
      
      const lesson = {
        id: lessonRows[0].id.toString(),
        name: lessonRows[0].name,
        description: lessonRows[0].description,
        lesson_type: lessonRows[0].lesson_type,
        order_index: lessonRows[0].order_index,
        xp_reward: lessonRows[0].xp_reward,
        created_at: lessonRows[0].created_at,
        unit_name: lessonRows[0].unit_name,
        course_name: lessonRows[0].course_name,
        course_id: lessonRows[0].course_id.toString(),
        content: []
      };
      
      // Get content based on lesson type
      let contentQuery = '';
      switch(lesson.lesson_type) {
        case 'vocabulary':
          contentQuery = `
            SELECT 
              id, 
              word, 
              translation, 
              pronunciation, 
              audio_url, 
              example_sentence, 
              example_translation,
              word_type,
              difficulty_level,
              order_index
            FROM vocabulary 
            WHERE lesson_id = ? 
            ORDER BY order_index`;
          break;
          
        case 'phrases':
          contentQuery = `
            SELECT 
              id, 
              phrase, 
              translation, 
              pronunciation, 
              audio_url, 
              context,
              difficulty_level,
              order_index
            FROM phrases 
            WHERE lesson_id = ? 
            ORDER BY order_index`;
          break;
          
        case 'grammar':
          contentQuery = `
            SELECT 
              id, 
              title, 
              explanation, 
              examples,
              difficulty_level,
              order_index
            FROM grammar_rules 
            WHERE lesson_id = ? 
            ORDER BY order_index`;
          break;
          
        case 'exercises':
          try {
            // Get exercises for this lesson
            const [exercises] = await connection.query(`
              SELECT 
                id,
                exercise_type as type,
                question,
                points,
                explanation,
                options,
                hints,
                correct_answer as correctAnswer,
                difficulty_level as difficulty,
                order_index as orderIndex
              FROM exercises 
              WHERE lesson_id = ?
              ORDER BY order_index
            `, [id]);

            // Parse JSON fields and format exercises
            const parsedExercises = exercises.map(ex => ({
              ...ex,
              id: ex.id.toString(),
              options: ex.options ? JSON.parse(ex.options) : [],
              hints: ex.hints ? JSON.parse(ex.hints) : [],
              // For matching exercises, structure the pairs
              ...(ex.type === 'matching' && {
                pairs: ex.options ? JSON.parse(ex.options).map((opt, idx) => ({
                  id: `pair-${idx}`,
                  left: opt.split(':')[0]?.trim() || '',
                  right: opt.split(':')[1]?.trim() || opt
                })) : []
              })
            }));

            lesson.content = {
              exercises: parsedExercises,
              instructions: 'Complete the following exercises to practice what you\'ve learned.'
            };
          } catch (error) {
            console.error('Error fetching exercises:', error);
            lesson.content = { exercises: [], error: 'Failed to load exercises' };
          }
          break;
          
        default:
          contentQuery = '';
      }
      
      if (contentQuery) {
        const [contentRows] = await connection.query(contentQuery, [id]);
        // Convert BigInt to string for JSON serialization
        lesson.content = contentRows.map(row => ({
          ...row,
          id: row.id.toString(),
          // Handle JSON fields
          examples: row.examples ? JSON.parse(row.examples) : null
        }));
      }
      
      await connection.commit();
      res.json(lesson);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lesson',
      message: error.message 
    });
  }
});

export default router;

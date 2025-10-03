import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// GET /api/languages - Get all languages
router.get('/', async (req, res) => {
  try {
    console.log('API: Fetching all languages');
    
    const [rows] = await pool.query(
      'SELECT id, name, code, flag_emoji, description, created_at FROM languages ORDER BY name'
    );
    
    console.log(`Found ${rows.length} languages`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch languages',
      message: error.message
    });
  }
});

// GET /api/languages/:id - Get language by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('API: Fetching language with ID:', id);
    
    const [rows] = await pool.query(
      'SELECT id, name, code, flag_emoji, description, created_at FROM languages WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Language not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching language:', error);
    res.status(500).json({ 
      error: 'Failed to fetch language',
      message: error.message
    });
  }
});

// POST /api/languages - Add a new language
router.post('/', async (req, res) => {
  try {
    const { name, code, flag_emoji, description } = req.body;
    console.log('API: Adding new language:', { name, code, flag_emoji, description });
    
    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ 
        error: 'Name and code are required fields' 
      });
    }
    
    // Check if language code already exists
    const [existing] = await pool.query(
      'SELECT id FROM languages WHERE code = ?',
      [code.toLowerCase()]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'Language with this code already exists' 
      });
    }
    
    // Insert new language
    const [result] = await pool.query(
      'INSERT INTO languages (name, code, flag_emoji, description) VALUES (?, ?, ?, ?)',
      [name, code.toLowerCase(), flag_emoji || '', description || '']
    );
    
    console.log('✅ Language added successfully with ID:', result.insertId);
    
    res.status(201).json({
      success: true,
      message: 'Language added successfully',
      id: result.insertId,
      language: {
        id: result.insertId,
        name,
        code: code.toLowerCase(),
        flag_emoji: flag_emoji || '',
        description: description || ''
      }
    });
    
  } catch (error) {
    console.error('Error adding language:', error);
    res.status(500).json({
      error: 'Failed to add language',
      message: error.message
    });
  }
});

// POST /api/languages/populate - Populate all 30 languages
router.post('/populate', async (req, res) => {
  try {
    console.log('API: Populating 30 languages in database');
    
    const languages = [
      { name: 'English', code: 'en', flag_emoji: '🇺🇸', description: 'Learn the global language of business and communication' },
      { name: 'Mandarin Chinese', code: 'zh', flag_emoji: '🇨🇳', description: 'Master the most spoken language in the world' },
      { name: 'Spanish', code: 'es', flag_emoji: '🇪🇸', description: 'Speak the language of over 500 million people' },
      { name: 'French', code: 'fr', flag_emoji: '🇫🇷', description: 'Learn the language of love and culture' },
      { name: 'Standard Arabic', code: 'ar', flag_emoji: '🇸🇦', description: 'Understand the language of the Quran and Middle East' },
      { name: 'Bengali', code: 'bn', flag_emoji: '🇧🇩', description: 'Explore the rich literary language of Bengal' },
      { name: 'Russian', code: 'ru', flag_emoji: '🇷🇺', description: 'Master the language of the largest country' },
      { name: 'Portuguese', code: 'pt', flag_emoji: '🇧🇷', description: 'Speak the language of Brazil and Portugal' },
      { name: 'Indonesian', code: 'id', flag_emoji: '🇮🇩', description: 'Discover the gateway to Southeast Asia' },
      { name: 'German', code: 'de', flag_emoji: '🇩🇪', description: 'Learn the language of innovation and philosophy' },
      { name: 'Japanese', code: 'ja', flag_emoji: '🇯🇵', description: 'Master the fascinating language of Japan' },
      { name: 'Swahili', code: 'sw', flag_emoji: '🇹🇿', description: 'Speak the lingua franca of East Africa' },
      { name: 'Turkish', code: 'tr', flag_emoji: '🇹🇷', description: 'Bridge Europe and Asia with Turkish' },
      { name: 'Korean', code: 'ko', flag_emoji: '🇰🇷', description: 'Learn the dynamic language of K-culture' },
      { name: 'Vietnamese', code: 'vi', flag_emoji: '🇻🇳', description: 'Explore the tonal language of Vietnam' },
      { name: 'Italian', code: 'it', flag_emoji: '🇮🇹', description: 'Speak the language of art and cuisine' },
      { name: 'Hausa', code: 'ha', flag_emoji: '🇳🇬', description: 'Learn the major language of West Africa' },
      { name: 'Thai', code: 'th', flag_emoji: '🇹🇭', description: 'Discover the melodic language of Thailand' },
      { name: 'Polish', code: 'pl', flag_emoji: '🇵🇱', description: 'Master the Slavic language of Poland' },
      { name: 'Burmese', code: 'my', flag_emoji: '🇲🇲', description: 'Learn the script and sounds of Myanmar' },
      { name: 'Persian (Farsi)', code: 'fa', flag_emoji: '🇮🇷', description: 'Discover the poetic language of Persia' },
      { name: 'Malay', code: 'ms', flag_emoji: '🇲🇾', description: 'Speak the unifying language of Malaysia' },
      { name: 'Amharic', code: 'am', flag_emoji: '🇪🇹', description: 'Learn the ancient language of Ethiopia' },
      { name: 'Dutch', code: 'nl', flag_emoji: '🇳🇱', description: 'Master the language of the Netherlands' },
      { name: 'Greek', code: 'el', flag_emoji: '🇬🇷', description: 'Learn the ancient language of philosophy' },
      { name: 'Hebrew', code: 'he', flag_emoji: '🇮🇱', description: 'Discover the revived ancient language' },
      { name: 'Czech', code: 'cs', flag_emoji: '🇨🇿', description: 'Explore the heart of Central Europe' },
      { name: 'Hungarian', code: 'hu', flag_emoji: '🇭🇺', description: 'Master the unique Finno-Ugric language' },
      { name: 'Swedish', code: 'sv', flag_emoji: '🇸🇪', description: 'Learn the melodic Scandinavian language' },
      { name: 'Norwegian', code: 'no', flag_emoji: '🇳🇴', description: 'Speak the language of the fjords' }
    ];

    let insertedCount = 0;
    let skippedCount = 0;

    for (const language of languages) {
      try {
        // Check if language already exists
        const [existing] = await pool.query(
          'SELECT id FROM languages WHERE code = ?',
          [language.code]
        );

        if (existing.length === 0) {
          // Insert new language
          await pool.query(
            'INSERT INTO languages (name, code, flag_emoji, description) VALUES (?, ?, ?, ?)',
            [language.name, language.code, language.flag_emoji, language.description]
          );
          insertedCount++;
          console.log(`✅ Inserted: ${language.name} (${language.code})`);
        } else {
          skippedCount++;
          console.log(`⏭️ Skipped: ${language.name} (${language.code}) - already exists`);
        }
      } catch (error) {
        console.error(`❌ Error inserting ${language.name}:`, error.message);
      }
    }

    console.log(`\n📊 Population complete: ${insertedCount} inserted, ${skippedCount} skipped`);
    
    res.json({
      success: true,
      message: `Successfully populated languages: ${insertedCount} inserted, ${skippedCount} already existed`,
      inserted: insertedCount,
      skipped: skippedCount,
      total: languages.length
    });

  } catch (error) {
    console.error('Error populating languages:', error);
    res.status(500).json({
      error: 'Failed to populate languages',
      message: error.message
    });
  }
});

export default router;
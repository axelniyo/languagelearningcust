import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import axios from 'axios';

const Course = () => {
  const { language } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/language/${language}`);
        setCourse(response.data);
      } catch (err) {
        setError('Course not found');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [language]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {course.name}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {course.level} • {course.language_name}
        </Typography>
        <Typography variant="body1" paragraph>
          {course.description}
        </Typography>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Course Content
      </Typography>
      <Paper elevation={2}>
        <List>
          {course.units && course.units.map((unit, index) => (
            <React.Fragment key={unit.id}>
              <ListItem>
                <ListItemText 
                  primary={`Unit ${index + 1}: ${unit.name}`}
                  secondary={unit.description}
                />
              </ListItem>
              {unit.lessons && unit.lessons.map(lesson => (
                <ListItem key={lesson.id} button component="a" href={`/lesson/${lesson.id}`}>
                  <ListItemText 
                    primary={`• ${lesson.title}`}
                    secondary={lesson.description}
                    sx={{ pl: 2 }}
                  />
                </ListItem>
              ))}
              {index < course.units.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Course;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, CssBaseline, Drawer, List, ListItem, ListItemText, Toolbar, AppBar, Typography, Box } from '@mui/material';
import AddLanguage from './components/AddLanguage.js';
import AddCourse from './components/AddCourse.js';
import AddUnit from './components/AddUnit.js';
import AddLesson from './components/AddLesson.js';
import AddVocabulary from './components/AddVocabulary.js';
import AddGrammar from './components/AddGrammar.js';
import AddPhrase from './components/AddPhrase.js';
import AddExercise from './components/AddExercise.js';
import Course from './components/Course.js';

const drawerWidth = 240;

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Language Course Admin
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem button component={Link} to="/add-language">
                <ListItemText primary="Add Language" />
              </ListItem>
              <ListItem button component={Link} to="/add-course">
                <ListItemText primary="Add Course" />
              </ListItem>
              <ListItem button component={Link} to="/add-unit">
                <ListItemText primary="Add Unit" />
              </ListItem>
              <ListItem button component={Link} to="/add-lesson">
                <ListItemText primary="Add Lesson" />
              </ListItem>
              <ListItem button component={Link} to="/add-vocabulary">
                <ListItemText primary="Add Vocabulary" />
              </ListItem>
              <ListItem button component={Link} to="/add-grammar">
                <ListItemText primary="Add Grammar" />
              </ListItem>
              <ListItem button component={Link} to="/add-phrase">
                <ListItemText primary="Add Phrase" />
              </ListItem>
              <ListItem button component={Link} to="/add-exercise">
                <ListItemText primary="Add Exercise" />
              </ListItem>
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Container maxWidth="md">
            <Routes>
              <Route path="/learn/:language" element={<Course />} />
              <Route path="/learn-:language" element={<Course />} />
              <Route path="/add-language" element={<AddLanguage />} />
              <Route path="/add-course" element={<AddCourse />} />
              <Route path="/add-unit" element={<AddUnit />} />
              <Route path="/add-lesson" element={<AddLesson />} />
              <Route path="/add-vocabulary" element={<AddVocabulary />} />
              <Route path="/add-grammar" element={<AddGrammar />} />
              <Route path="/add-phrase" element={<AddPhrase />} />
              <Route path="/add-exercise" element={<AddExercise />} />
              <Route path="*" element={<Typography variant="h5">Welcome to the Language Course Admin UI!</Typography>} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

export default App;

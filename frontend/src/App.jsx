import React from 'react'
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper
} from '@mui/material'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Link as LinkIcon, Analytics } from '@mui/icons-material'
import URLShortenerPage from './pages/URLShortenerPage'
import StatisticsPage from './pages/StatisticsPage'
import './App.css'

function Header() {
  const location = useLocation();
  const isStatsPage = location.pathname === '/statistics';
  
  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      boxShadow: 3
    }}>
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LinkIcon sx={{ mr: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }} />
          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
            }}
          >
            URL Shortener
          </Typography>
        </Box>
        <Box>
          <Button 
            component={Link} 
            to="/" 
            color={!isStatsPage ? "secondary" : "inherit"}
            variant={!isStatsPage ? "contained" : "text"}
            sx={{ 
              mr: 1,
              fontWeight: 'bold',
              borderRadius: 2
            }}
          >
            Shorten URL
          </Button>
          <Button 
            component={Link} 
            to="/statistics" 
            color={isStatsPage ? "secondary" : "inherit"}
            variant={isStatsPage ? "contained" : "text"}
            startIcon={<Analytics />}
            sx={{ 
              fontWeight: 'bold',
              borderRadius: 2
            }}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Box sx={{ 
        width: '100%',
        minHeight: ['100vh', '100dvh'],
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header />
        <Container maxWidth="xl" sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          py: { xs: 2, sm: 3, md: 4 }
        }}>
          <Paper 
            elevation={0} 
            sx={{ 
              flexGrow: 1, 
              bgcolor: 'transparent', 
              boxShadow: 'none'
            }}
          >
            <Routes>
              <Route path="/" element={<URLShortenerPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
            </Routes>
          </Paper>
        </Container>
      </Box>
    </BrowserRouter>
  );
}

export default App

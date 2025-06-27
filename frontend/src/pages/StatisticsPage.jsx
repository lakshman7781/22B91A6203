import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Typography,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Divider,
  Button,
  Switch,
  FormControlLabel} from '@mui/material'
import {
  ContentCopy,
  Analytics,
  AccessTime,
  ExpandMore,
  ExpandLess,
  Link as LinkIcon,
  Refresh,
  Computer,
  Person
} from '@mui/icons-material'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'
const AUTO_REFRESH_INTERVAL = 5000 // 5 seconds

function StatisticsPage() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [expandedUrls, setExpandedUrls] = useState({})
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(null)
  const refreshTimerRef = useRef(null)
  
  const fetchAllUrls = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      const response = await axios.get(`${API_BASE_URL}/api/urls`)
      setUrls(response.data.urls)
      
      // If auto-refreshing, show a brief notification
      if (!showLoading && autoRefresh) {
        setSnackbar({
          open: true,
          message: 'Statistics updated',
          severity: 'info',
          autoHideDuration: 2000
        })
      }
    } catch (err) {
      console.error('Error fetching URLs:', err)
      setSnackbar({
        open: true,
        message: 'Failed to load URLs',
        severity: 'error'
      })
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [autoRefresh])
  
  useEffect(() => {
    // Initial fetch and set "last refreshed" time
    fetchAllUrls()
    setLastRefreshed(new Date())
    
    // Clean up timer when component unmounts
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [fetchAllUrls])
  
  // Set up or clear auto-refresh based on state
  useEffect(() => {
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        fetchAllUrls(false) // Don't show loading indicator for auto-refresh
        setLastRefreshed(new Date())
      }, AUTO_REFRESH_INTERVAL)
    } else if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [autoRefresh, fetchAllUrls])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setSnackbar({
      open: true,
      message: 'Copied to clipboard!',
      severity: 'success'
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const toggleExpand = (shortcode) => {
    setExpandedUrls({
      ...expandedUrls,
      [shortcode]: !expandedUrls[shortcode]
    })
  }

  const deleteUrl = async (shortcode) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/urls/${shortcode}`)
      setSnackbar({
        open: true,
        message: 'URL deleted successfully!',
        severity: 'success'
      })
      fetchAllUrls()
    } catch (err) {
      console.error('Error deleting URL:', err)
      setSnackbar({
        open: true,
        message: 'Error deleting URL',
        severity: 'error'
      })
    }
  }

  return (
    <Box sx={{ 
      padding: { 
        xs: 'clamp(1rem, 3vw, 1.5rem)',
        sm: 'clamp(1.5rem, 3.5vw, 2rem)',
        md: 'clamp(2rem, 3vw, 3rem)'
      }
    }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: { 
            xs: 'clamp(1rem, 3vw, 1.5rem)',
            sm: 'clamp(1.5rem, 3.5vw, 2rem)',
            md: 'clamp(2rem, 3vw, 3rem)'
          }, 
          borderRadius: 3,
          maxWidth: '1400px',
          mx: 'auto'
        }}
      >
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              fontSize: {
                xs: 'clamp(1.1rem, 3vw, 1.25rem)',
                sm: 'clamp(1.25rem, 3.5vw, 1.5rem)',
                md: 'clamp(1.4rem, 3vw, 1.75rem)'
              }
            }}
          >
            URL Statistics
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={() => setAutoRefresh(!autoRefresh)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Typography sx={{ 
                  fontSize: {
                    xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                    sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                  }
                }}>
                  Auto Refresh
                </Typography>
              }
              sx={{ 
                m: 0,
                '& .MuiFormControlLabel-label': {
                  color: 'text.secondary',
                  fontSize: {
                    xs: 'clamp(0.75rem, 2vw, 0.875rem)',
                    sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                  }
                }
              }}
            />
            
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                fetchAllUrls();
                setLastRefreshed(new Date());
              }}
              startIcon={<Refresh />}
              sx={{ 
                borderRadius: 2,
                fontSize: {
                  xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                  sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                }
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        {lastRefreshed && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              display: 'block', 
              textAlign: 'right', 
              mb: 2,
              fontSize: {
                xs: 'clamp(0.7rem, 2vw, 0.75rem)',
                sm: 'clamp(0.75rem, 2.2vw, 0.875rem)'
              }
            }}
          >
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </Typography>
        )}
        
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 300
          }}>
            <CircularProgress />
          </Box>
        ) : urls.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: { xs: 4, sm: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 300
          }}>
            <LinkIcon sx={{ 
              fontSize: { 
                xs: 'clamp(2.5rem, 6vw, 3rem)', 
                sm: 'clamp(3rem, 7vw, 4rem)' 
              }, 
              color: 'text.secondary', 
              mb: 2 
            }} />
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ 
              fontSize: { 
                xs: 'clamp(1rem, 3vw, 1.1rem)', 
                sm: 'clamp(1.1rem, 3.5vw, 1.25rem)' 
              } 
            }}>
              No URLs created yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ 
              fontSize: { 
                xs: 'clamp(0.85rem, 2.5vw, 0.9rem)', 
                sm: 'clamp(0.9rem, 2.8vw, 1rem)' 
              } 
            }}>
              Create your first short URL!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {urls.map((urlData) => (
              <Grid item xs={12} key={urlData.shortcode}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 2
                    }
                  }}
                >
                  <CardContent sx={{ 
                    p: { 
                      xs: 'clamp(1rem, 2.5vw, 1.5rem)',
                      sm: 'clamp(1.5rem, 3vw, 2rem)'
                    } 
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      mb: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 2, sm: 1 }
                    }}>
                      <Box sx={{ 
                        flex: 1, 
                        minWidth: 0, 
                        width: { xs: '100%', sm: 'auto' } 
                      }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1
                        }}>
                          <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: 'primary.main',
                              fontSize: {
                                xs: 'clamp(0.9rem, 2.5vw, 1rem)',
                                sm: 'clamp(1rem, 3vw, 1.1rem)',
                                md: 'clamp(1.1rem, 2.5vw, 1.2rem)'
                              }
                            }}
                          >
                            {urlData.short_url}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(urlData.short_url)}
                            sx={{ 
                              bgcolor: 'primary.50',
                              '&:hover': { bgcolor: 'primary.100' }
                            }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            wordBreak: 'break-all',
                            mb: 1,
                            opacity: 0.8,
                            fontSize: {
                              xs: 'clamp(0.75rem, 2vw, 0.8rem)',
                              sm: 'clamp(0.8rem, 2.2vw, 0.875rem)'
                            }
                          }}
                        >
                          <strong>Original:</strong> {urlData.original_url}
                        </Typography>
                      </Box>
                      
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'flex-start', sm: 'flex-end' },
                        gap: 1
                      }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => deleteUrl(urlData.shortcode)}
                          sx={{ 
                            borderRadius: 2,
                            fontSize: {
                              xs: 'clamp(0.7rem, 2vw, 0.75rem)',
                              sm: 'clamp(0.75rem, 2.2vw, 0.875rem)'
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      flexWrap: 'wrap',
                      mb: 2,
                      '& .MuiChip-root': {
                        fontSize: {
                          xs: 'clamp(0.65rem, 1.8vw, 0.7rem)',
                          sm: 'clamp(0.7rem, 2vw, 0.75rem)'
                        }
                      }
                    }}>
                      <Chip
                        icon={<Analytics />}
                        label={`${urlData.click_count} clicks`}
                        size="small"
                        color={urlData.click_count > 0 ? "primary" : "default"}
                        sx={{ 
                          fontWeight: 'bold'
                        }}
                      />
                      <Chip
                        icon={<AccessTime />}
                        label={urlData.is_expired ? 'Expired' : 'Active'}
                        size="small"
                        color={urlData.is_expired ? "error" : "success"}
                        sx={{ 
                          fontWeight: 'bold'
                        }}
                      />
                      <Chip
                        label={`Created: ${formatDate(urlData.created_at)}`}
                        size="small"
                        sx={{ 
                          bgcolor: 'grey.100'
                        }}
                      />
                      <Chip
                        label={`Expires: ${formatDate(urlData.expires_at)}`}
                        size="small"
                        sx={{ 
                          bgcolor: 'grey.100'
                        }}
                      />
                    </Box>
                    
                    {/* Toggle click history */}
                    {urlData.click_count > 0 && (
                      <>
                        <Button
                          onClick={() => toggleExpand(urlData.shortcode)}
                          startIcon={expandedUrls[urlData.shortcode] ? <ExpandLess /> : <ExpandMore />}
                          variant="text"
                          size="small"
                          sx={{
                            mb: 1,
                            fontSize: {
                              xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                              sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                            }
                          }}
                        >
                          {expandedUrls[urlData.shortcode] ? 'Hide' : 'Show'} Click History ({urlData.click_history?.length || 0})
                        </Button>
                        
                        <Collapse in={expandedUrls[urlData.shortcode]}>
                          {urlData.click_history && urlData.click_history.length > 0 ? (
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mt: 1 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ 
                                      fontWeight: 'bold',
                                      fontSize: {
                                        xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                                        sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                                      }
                                    }}>
                                      Date & Time
                                    </TableCell>
                                    <TableCell sx={{ 
                                      fontWeight: 'bold',
                                      fontSize: {
                                        xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                                        sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                                      }
                                    }}>
                                      IP Address
                                    </TableCell>
                                    <TableCell sx={{ 
                                      fontWeight: 'bold',
                                      fontSize: {
                                        xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                                        sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                                      }
                                    }}>
                                      User Agent / Source
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {urlData.click_history.map((click, index) => (
                                    <TableRow key={index}>
                                      <TableCell sx={{ 
                                        fontSize: {
                                          xs: 'clamp(0.7rem, 2vw, 0.75rem)',
                                          sm: 'clamp(0.75rem, 2.2vw, 0.875rem)'
                                        }
                                      }}>
                                        {formatDate(click.timestamp)}
                                      </TableCell>
                                      <TableCell sx={{ 
                                        fontSize: {
                                          xs: 'clamp(0.7rem, 2vw, 0.75rem)',
                                          sm: 'clamp(0.75rem, 2.2vw, 0.875rem)'
                                        }
                                      }}>
                                        {click.ip_address || 'Unknown'}
                                      </TableCell>
                                      <TableCell sx={{ 
                                        fontSize: {
                                          xs: 'clamp(0.7rem, 2vw, 0.75rem)',
                                          sm: 'clamp(0.75rem, 2.2vw, 0.875rem)'
                                        }
                                      }}>
                                        {click.user_agent || 'Unknown'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                mt: 1,
                                fontSize: {
                                  xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                                  sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                                }
                              }}
                            >
                              No click history available
                            </Typography>
                          )}
                        </Collapse>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Last refreshed info */}
        <Divider sx={{ my: 3 }} />
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
          sx={{ 
            fontSize: {
              xs: 'clamp(0.75rem, 2vw, 0.875rem)',
              sm: 'clamp(0.875rem, 2.5vw, 1rem)'
            }
          }}
        >
          {`Last refreshed: ${lastRefreshed ? lastRefreshed.toLocaleString() : 'Never'}`}
        </Typography>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: '100%', 
            borderRadius: 2,
            fontSize: {
              xs: 'clamp(0.85rem, 2.5vw, 0.9rem)',
              sm: 'clamp(0.9rem, 2.8vw, 1rem)'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default StatisticsPage

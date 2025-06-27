import { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  ContentCopy,
  Delete,
  Analytics,
  Link as LinkIcon,
  AccessTime,
} from '@mui/icons-material'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [url, setUrl] = useState('')
  const [customShortcode, setCustomShortcode] = useState('')
  const [validityMinutes, setValidityMinutes] = useState(30)
  const [shortenedUrl, setShortenedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [urls, setUrls] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [statsDialog, setStatsDialog] = useState({ open: false, stats: null })

  useEffect(() => {
    fetchAllUrls()
  }, [])

  const fetchAllUrls = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/urls`)
      setUrls(response.data.urls)
    } catch (err) {
      console.error('Error fetching URLs:', err)
      setSnackbar({
        open: true,
        message: 'Failed to load URLs',
        severity: 'error'
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    try {
      const payload = {
        original_url: url,
        validity_minutes: validityMinutes
      }
      
      if (customShortcode.trim()) {
        payload.custom_shortcode = customShortcode.trim()
      }

      const response = await axios.post(`${API_BASE_URL}/shorten`, payload)
      setShortenedUrl(response.data.short_url)
      setSnackbar({
        open: true,
        message: 'URL shortened successfully!',
        severity: 'success'
      })
      
      // Reset form
      setUrl('')
      setCustomShortcode('')
      setValidityMinutes(30)
      
      // Refresh the list
      fetchAllUrls()
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Error shortening URL',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setSnackbar({
      open: true,
      message: 'Copied to clipboard!',
      severity: 'success'
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

  const showStats = async (shortcode) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stats/${shortcode}`)
      setStatsDialog({ open: true, stats: response.data })
    } catch (err) {
      console.error('Error fetching stats:', err)
      setSnackbar({
        open: true,
        message: 'Error fetching stats',
        severity: 'error'
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: ['100vh', '100dvh'], // Fallback and dynamic viewport height
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: {
        xs: '1rem',
        sm: '1.5rem', 
        md: '2rem',
        lg: '2.5rem',
        xl: '3rem'
      },
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        mb: { xs: 2, sm: 3, md: 4 }, 
        textAlign: 'center',
        flexShrink: 0
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontSize: {
              xs: 'clamp(1.5rem, 4vw, 2rem)',
              sm: 'clamp(2rem, 5vw, 2.5rem)',
              md: 'clamp(2.5rem, 6vw, 3rem)',
              lg: 'clamp(2.8rem, 5vw, 3.5rem)'
            },
            lineHeight: 1.2
          }}
        >
          <LinkIcon sx={{ 
            fontSize: {
              xs: 'clamp(1.5rem, 4vw, 2rem)',
              sm: 'clamp(2rem, 5vw, 2.5rem)',
              md: 'clamp(2.5rem, 6vw, 3rem)'
            }, 
            mr: { xs: 1, sm: 2 }, 
            verticalAlign: 'middle' 
          }} />
          URL Shortener
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white', 
            opacity: 0.9,
            fontSize: {
              xs: 'clamp(0.9rem, 2.5vw, 1rem)',
              sm: 'clamp(1rem, 3vw, 1.1rem)',
              md: 'clamp(1.1rem, 2.5vw, 1.25rem)'
            }
          }}
        >
          Create short, manageable links with analytics
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        width: '100%',
        maxWidth: '100%'
      }}>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ 
          width: '100%',
          margin: 0,
          '& .MuiGrid-item': {
            paddingLeft: { xs: 2, sm: 3, md: 4 },
            paddingTop: { xs: 2, sm: 3, md: 4 }
          }
        }}>
          {/* URL Shortening Form */}
          <Grid item xs={12} xl={6} sx={{ 
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Paper elevation={6} sx={{ 
              p: { 
                xs: 'clamp(1rem, 3vw, 2rem)', 
                sm: 'clamp(1.5rem, 3.5vw, 2.5rem)', 
                md: 'clamp(2rem, 3vw, 3rem)' 
              }, 
              borderRadius: 3, 
              height: 'fit-content',
              flex: { xl: 1 }
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 'bold',
                  fontSize: {
                    xs: 'clamp(1.1rem, 3vw, 1.25rem)',
                    sm: 'clamp(1.25rem, 3.5vw, 1.5rem)',
                    md: 'clamp(1.4rem, 3vw, 1.75rem)'
                  }
                }}
              >
                Create Short URL
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Original URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      required
                      variant="outlined"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          fontSize: {
                            xs: 'clamp(0.875rem, 2.5vw, 1rem)',
                            sm: 'clamp(1rem, 2.8vw, 1.125rem)'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: {
                            xs: 'clamp(0.875rem, 2.5vw, 1rem)',
                            sm: 'clamp(1rem, 2.8vw, 1.125rem)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode (Optional)"
                      value={customShortcode}
                      onChange={(e) => setCustomShortcode(e.target.value)}
                      placeholder="mycustomcode"
                      variant="outlined"
                      helperText="3-20 alphanumeric characters"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          fontSize: {
                            xs: 'clamp(0.875rem, 2.5vw, 1rem)',
                            sm: 'clamp(1rem, 2.8vw, 1.125rem)'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: {
                            xs: 'clamp(0.875rem, 2.5vw, 1rem)',
                            sm: 'clamp(1rem, 2.8vw, 1.125rem)'
                          }
                        },
                        '& .MuiFormHelperText-root': {
                          fontSize: {
                            xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                            sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Validity (Minutes)"
                      value={validityMinutes}
                      onChange={(e) => setValidityMinutes(parseInt(e.target.value) || 30)}
                      variant="outlined"
                      inputProps={{ min: 1, max: 43200 }}
                      helperText="Link expiry time in minutes"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          fontSize: {
                            xs: 'clamp(0.875rem, 2.5vw, 1rem)',
                            sm: 'clamp(1rem, 2.8vw, 1.125rem)'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: {
                            xs: 'clamp(0.875rem, 2.5vw, 1rem)',
                            sm: 'clamp(1rem, 2.8vw, 1.125rem)'
                          }
                        },
                        '& .MuiFormHelperText-root': {
                          fontSize: {
                            xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                            sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      sx={{ 
                        height: {
                          xs: 'clamp(48px, 8vw, 56px)',
                          sm: 'clamp(56px, 7vw, 64px)',
                          md: 'clamp(60px, 6vw, 72px)'
                        },
                        borderRadius: 3,
                        fontSize: {
                          xs: 'clamp(1rem, 3vw, 1.1rem)',
                          sm: 'clamp(1.1rem, 3.5vw, 1.25rem)',
                          md: 'clamp(1.2rem, 3vw, 1.4rem)'
                        },
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Shorten URL'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {shortenedUrl && (
                <Box sx={{ 
                  mt: 3, 
                  p: {
                    xs: 'clamp(1rem, 3vw, 1.5rem)',
                    sm: 'clamp(1.5rem, 3.5vw, 2rem)'
                  }, 
                  bgcolor: 'success.50', 
                  borderRadius: 2, 
                  border: '1px solid', 
                  borderColor: 'success.200' 
                }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      color: 'success.main', 
                      fontWeight: 'bold',
                      fontSize: {
                        xs: 'clamp(1rem, 3vw, 1.1rem)',
                        sm: 'clamp(1.1rem, 3.5vw, 1.25rem)',
                        md: 'clamp(1.2rem, 3vw, 1.4rem)'
                      }
                    }}
                  >
                    ✅ Shortened URL Created!
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    flexDirection: { xs: 'column', sm: 'row' } 
                  }}>
                    <TextField
                      fullWidth
                      value={shortenedUrl}
                      variant="outlined"
                      size="small"
                      InputProps={{ 
                        readOnly: true,
                        sx: { 
                          bgcolor: 'white',
                          borderRadius: 2,
                          fontFamily: 'monospace',
                          fontSize: {
                            xs: 'clamp(0.75rem, 2.2vw, 0.8rem)',
                            sm: 'clamp(0.8rem, 2.5vw, 0.875rem)',
                            md: 'clamp(0.875rem, 2.2vw, 1rem)'
                          }
                        }
                      }}
                    />
                    <IconButton 
                      onClick={() => copyToClipboard(shortenedUrl)} 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        minWidth: { xs: '100%', sm: 'auto' },
                        mt: { xs: 1, sm: 0 },
                        height: {
                          xs: 'clamp(40px, 6vw, 48px)',
                          sm: 'clamp(44px, 5vw, 52px)'
                        },
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      <ContentCopy />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* URLs List */}
          <Grid item xs={12} xl={6} sx={{ 
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Paper elevation={6} sx={{ 
              p: { 
                xs: 'clamp(1rem, 3vw, 2rem)', 
                sm: 'clamp(1.5rem, 3.5vw, 2.5rem)', 
                md: 'clamp(2rem, 3vw, 3rem)' 
              }, 
              borderRadius: 3, 
              height: { xl: '100%' },
              flex: { xl: 1 },
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 'bold',
                  fontSize: {
                    xs: 'clamp(1.1rem, 3vw, 1.25rem)',
                    sm: 'clamp(1.25rem, 3.5vw, 1.5rem)',
                    md: 'clamp(1.4rem, 3vw, 1.75rem)'
                  },
                  flexShrink: 0
                }}
              >
                Your URLs ({urls.length})
              </Typography>
              
              <Box sx={{ 
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ 
                  flex: 1,
                  overflowY: 'auto', 
                  pr: 1,
                  minHeight: { xs: 300, sm: 400, xl: 0 }
                }}>
                  {urls.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: { xs: 4, sm: 6 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: 200
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
                    <Grid container spacing={2}>
                      {urls.map((urlData) => (
                        <Grid item xs={12} key={urlData.shortcode}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: 3,
                                transform: 'translateY(-2px)'
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
                                <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
                                  <Typography 
                                    variant="h6" 
                                    component="div" 
                                    sx={{ 
                                      fontWeight: 'bold',
                                      color: 'primary.main',
                                      wordBreak: 'break-all',
                                      mb: 1,
                                      fontSize: {
                                        xs: 'clamp(0.9rem, 2.5vw, 1rem)',
                                        sm: 'clamp(1rem, 3vw, 1.1rem)',
                                        md: 'clamp(1.1rem, 2.5vw, 1.2rem)'
                                      }
                                    }}
                                  >
                                    {urlData.short_url}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    sx={{ 
                                      wordBreak: 'break-all',
                                      opacity: 0.8,
                                      fontSize: {
                                        xs: 'clamp(0.75rem, 2vw, 0.8rem)',
                                        sm: 'clamp(0.8rem, 2.2vw, 0.875rem)'
                                      }
                                    }}
                                  >
                                    {urlData.original_url}
                                  </Typography>
                                </Box>
                                <Box sx={{ 
                                  display: 'flex', 
                                  gap: 1, 
                                  flexShrink: 0,
                                  width: { xs: '100%', sm: 'auto' },
                                  justifyContent: { xs: 'center', sm: 'flex-end' }
                                }}>
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
                                  <IconButton
                                    size="small"
                                    onClick={() => showStats(urlData.shortcode)}
                                    sx={{ 
                                      bgcolor: 'info.50',
                                      '&:hover': { bgcolor: 'info.100' }
                                    }}
                                  >
                                    <Analytics fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => deleteUrl(urlData.shortcode)}
                                    sx={{ 
                                      bgcolor: 'error.50',
                                      '&:hover': { bgcolor: 'error.100' }
                                    }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box sx={{ 
                                display: 'flex', 
                                gap: 1, 
                                flexWrap: 'wrap',
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
                                  sx={{ 
                                    bgcolor: 'primary.100',
                                    color: 'primary.main',
                                    fontWeight: 'bold'
                                  }}
                                />
                                <Chip
                                  icon={<AccessTime />}
                                  label={urlData.is_expired ? 'Expired' : 'Active'}
                                  size="small"
                                  sx={{ 
                                    bgcolor: urlData.is_expired ? 'error.100' : 'success.100',
                                    color: urlData.is_expired ? 'error.main' : 'success.main',
                                    fontWeight: 'bold'
                                  }}
                                />
                                <Chip
                                  label={`Expires: ${formatDate(urlData.expires_at)}`}
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'grey.100',
                                    display: { xs: 'none', sm: 'inline-flex', md: 'none', lg: 'inline-flex' }
                                  }}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

        {/* Stats Dialog */}
        <Dialog 
          open={statsDialog.open} 
          onClose={() => setStatsDialog({ open: false, stats: null })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 3,
              m: { xs: 2, sm: 3 }
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            fontWeight: 'bold',
            fontSize: {
              xs: 'clamp(1rem, 3vw, 1.1rem)',
              sm: 'clamp(1.1rem, 3.5vw, 1.25rem)'
            }
          }}>
            📊 URL Statistics
          </DialogTitle>
          <DialogContent sx={{ 
            p: { 
              xs: 'clamp(1rem, 3vw, 1.5rem)', 
              sm: 'clamp(1.5rem, 3.5vw, 2rem)' 
            } 
          }}>
            {statsDialog.stats && (
              <Box>
                <Typography variant="body1" sx={{ 
                  mb: 2, 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  fontSize: {
                    xs: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                    sm: 'clamp(0.9rem, 2.8vw, 1rem)'
                  }
                }}>
                  <strong>Shortcode:</strong> 
                  <Box component="span" sx={{ 
                    fontFamily: 'monospace', 
                    bgcolor: 'primary.100', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    ml: 1,
                    fontSize: {
                      xs: 'clamp(0.75rem, 2.2vw, 0.8rem)',
                      sm: 'clamp(0.8rem, 2.5vw, 0.875rem)'
                    }
                  }}>
                    {statsDialog.stats.shortcode}
                  </Box>
                </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 2, 
                  wordBreak: 'break-all',
                  fontSize: {
                    xs: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                    sm: 'clamp(0.9rem, 2.8vw, 1rem)'
                  }
                }}>
                  <strong>Original URL:</strong> {statsDialog.stats.original_url}
                </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 2, 
                  fontFamily: 'monospace',
                  fontSize: {
                    xs: 'clamp(0.75rem, 2.2vw, 0.8rem)',
                    sm: 'clamp(0.8rem, 2.5vw, 0.875rem)'
                  }
                }}>
                  <strong>Short URL:</strong> {statsDialog.stats.short_url}
                </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 2,
                  fontSize: {
                    xs: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                    sm: 'clamp(0.9rem, 2.8vw, 1rem)'
                  }
                }}>
                  <strong>Click Count:</strong> 
                  <Chip label={statsDialog.stats.click_count} color="primary" size="small" sx={{ ml: 1 }} />
                </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 2,
                  fontSize: {
                    xs: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                    sm: 'clamp(0.9rem, 2.8vw, 1rem)'
                  }
                }}>
                  <strong>Created:</strong> {formatDate(statsDialog.stats.created_at)}
                </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 2,
                  fontSize: {
                    xs: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                    sm: 'clamp(0.9rem, 2.8vw, 1rem)'
                  }
                }}>
                  <strong>Expires:</strong> {formatDate(statsDialog.stats.expires_at)}
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontSize: {
                    xs: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                    sm: 'clamp(0.9rem, 2.8vw, 1rem)'
                  } 
                }}>
                  <strong>Status:</strong>
                  <Chip
                    label={statsDialog.stats.is_expired ? 'Expired' : 'Active'}
                    size="small"
                    sx={{
                      bgcolor: statsDialog.stats.is_expired ? 'error.100' : 'success.100',
                      color: statsDialog.stats.is_expired ? 'error.main' : 'success.main',
                      fontWeight: 'bold',
                      ml: 1
                    }}
                  />
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: { 
              xs: 'clamp(1rem, 3vw, 1.5rem)', 
              sm: 'clamp(1.5rem, 3.5vw, 2rem)' 
            }, 
            bgcolor: 'grey.50' 
          }}>
            <Button 
              onClick={() => setStatsDialog({ open: false, stats: null })}
              variant="contained"
              sx={{ borderRadius: 2 }}
              fullWidth
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
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

export default App

import { useState } from 'react'
import {
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
  FormControlLabel,
  Switch,
  Fab,
  Divider,
  Tooltip
} from '@mui/material'
import {
  ContentCopy,
  Delete,
  Add as AddIcon,
  AccessTime,
  LinkOff
} from '@mui/icons-material'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'
const MAX_URL_FORMS = 5

function URLShortenerPage() {
  const [urlForms, setUrlForms] = useState([
    { url: '', customShortcode: '', validityMinutes: 30, id: Date.now() }
  ])
  const [shortenedUrls, setShortenedUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [bulkMode, setBulkMode] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const addUrlForm = () => {
    if (urlForms.length < MAX_URL_FORMS) {
      setUrlForms([
        ...urlForms,
        { url: '', customShortcode: '', validityMinutes: 30, id: Date.now() }
      ])
    } else {
      setSnackbar({
        open: true,
        message: `Maximum of ${MAX_URL_FORMS} URLs allowed at once`,
        severity: 'warning'
      })
    }
  }

  const removeUrlForm = (id) => {
    if (urlForms.length > 1) {
      setUrlForms(urlForms.filter(form => form.id !== id))
    } else {
      setSnackbar({
        open: true,
        message: 'At least one URL is required',
        severity: 'warning'
      })
    }
  }

  const updateUrlForm = (id, field, value) => {
    setUrlForms(urlForms.map(form => 
      form.id === id ? { ...form, [field]: value } : form
    ))
  }

  const validateForms = () => {
    const errors = []
    
    urlForms.forEach((form, index) => {
      // Check if URL is provided
      if (!form.url.trim()) {
        errors.push(`URL #${index + 1} is required`)
      } else {
        try {
          // Enhanced URL validation
          const urlObj = new URL(form.url)
          if (!['http:', 'https:'].includes(urlObj.protocol)) {
            errors.push(`URL #${index + 1} must use http or https protocol`)
          }
        } catch {
          errors.push(`URL #${index + 1} is invalid`)
        }
      }
      
      // Validate customShortcode if provided
      if (form.customShortcode) {
        if (form.customShortcode.length < 3 || form.customShortcode.length > 20) {
          errors.push(`Custom shortcode #${index + 1} must be between 3-20 characters`)
        }
        
        if (!form.customShortcode.match(/^[a-zA-Z0-9]+$/)) {
          errors.push(`Custom shortcode #${index + 1} must be alphanumeric`)
        }
      }
      
      // Validate validity period
      if (!Number.isInteger(form.validityMinutes) || form.validityMinutes < 1) {
        errors.push(`Validity period #${index + 1} must be a positive integer`)
      }
    })
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const errors = validateForms()
    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors.join(', '),
        severity: 'error'
      })
      return
    }
    
    setLoading(true)
    setShowResults(true)
    
    try {
      let response
      
      if (urlForms.length > 1 || bulkMode) {
        // Bulk URL shortening
        const payload = urlForms.map(form => ({
          original_url: form.url,
          custom_shortcode: form.customShortcode || undefined,
          validity_minutes: form.validityMinutes
        }))
        
        response = await axios.post(`${API_BASE_URL}/shorten/bulk`, payload)
        setShortenedUrls(response.data)
      } else {
        // Single URL shortening
        const form = urlForms[0]
        const payload = {
          original_url: form.url,
          validity_minutes: form.validityMinutes
        }
        
        if (form.customShortcode) {
          payload.custom_shortcode = form.customShortcode
        }
        
        response = await axios.post(`${API_BASE_URL}/shorten`, payload)
        setShortenedUrls([response.data])
      }
      
      setSnackbar({
        open: true,
        message: 'URLs shortened successfully!',
        severity: 'success'
      })
      
      // Reset forms
      setUrlForms([
        { url: '', customShortcode: '', validityMinutes: 30, id: Date.now() }
      ])
    } catch (error) {
      console.error('Error shortening URLs:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Error shortening URLs',
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const clearResults = () => {
    setShortenedUrls([])
    setShowResults(false)
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
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
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
            Create Short URLs
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={bulkMode}
                onChange={() => setBulkMode(!bulkMode)}
                color="primary"
              />
            }
            label={
              <Typography sx={{ 
                fontSize: {
                  xs: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                  sm: 'clamp(0.9rem, 2.8vw, 1rem)'
                }
              }}>
                Bulk Mode
              </Typography>
            }
          />
        </Box>
        
        {/* URL Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {urlForms.map((form, index) => (
            <Paper 
              key={form.id} 
              variant="outlined"
              sx={{ 
                p: { 
                  xs: 'clamp(0.75rem, 2.5vw, 1rem)',
                  sm: 'clamp(1rem, 3vw, 1.5rem)'
                }, 
                mb: 2,
                borderRadius: 2,
                position: 'relative',
                borderColor: 'divider'
              }}
            >
              {urlForms.length > 1 && (
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: {
                        xs: 'clamp(0.9rem, 2.8vw, 1rem)',
                        sm: 'clamp(1rem, 3vw, 1.1rem)'
                      }
                    }}
                  >
                    URL #{index + 1}
                  </Typography>
                  
                  <IconButton 
                    size="small" 
                    onClick={() => removeUrlForm(form.id)}
                    color="error"
                    sx={{ 
                      bgcolor: 'error.50',
                      '&:hover': { bgcolor: 'error.100' }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Original URL"
                    value={form.url}
                    onChange={(e) => updateUrlForm(form.id, 'url', e.target.value)}
                    placeholder="https://example.com"
                    required
                    variant="outlined"
                    helperText="Enter a valid URL starting with http:// or https://"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        fontSize: {
                          xs: 'clamp(0.875rem, 3vw, 1rem)',
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
                    label="Custom Shortcode (Optional)"
                    value={form.customShortcode}
                    onChange={(e) => updateUrlForm(form.id, 'customShortcode', e.target.value)}
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
                    value={form.validityMinutes}
                    onChange={(e) => updateUrlForm(form.id, 'validityMinutes', parseInt(e.target.value) || 30)}
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
              </Grid>
            </Paper>
          ))}
          
          {/* Add URL button */}
          {urlForms.length < MAX_URL_FORMS && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Tooltip title={`Add another URL (up to ${MAX_URL_FORMS} URLs)`}>
                <Fab 
                  color="primary" 
                  aria-label="add" 
                  onClick={addUrlForm}
                  variant="extended"
                  sx={{
                    px: 2,
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' },
                    boxShadow: 2
                  }}
                >
                  <AddIcon sx={{ mr: 1 }} /> Add URL ({urlForms.length}/{MAX_URL_FORMS})
                </Fab>
              </Tooltip>
            </Box>
          )}
          
          {/* Submit button */}
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
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Shorten URL' + (urlForms.length > 1 ? 's' : '')}
          </Button>
        </Box>
        
        {/* Results */}
        {showResults && shortenedUrls.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'success.main',
                  fontSize: {
                    xs: 'clamp(1.1rem, 3vw, 1.25rem)',
                    sm: 'clamp(1.25rem, 3.5vw, 1.5rem)',
                    md: 'clamp(1.4rem, 3vw, 1.75rem)'
                  }
                }}
              >
                Shortened URLs
              </Typography>
              
              <Button 
                variant="outlined" 
                onClick={clearResults}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: {
                    xs: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                    sm: 'clamp(0.9rem, 2.8vw, 1rem)'
                  }
                }}
              >
                Create New URLs
              </Button>
            </Box>
            
            <Divider sx={{ mb: 3, borderColor: 'grey.300' }} />
            
            <Grid container spacing={3}>
              {shortenedUrls.map((urlData, index) => (
                <Grid item xs={12} key={urlData.shortcode || `url-${index}`}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      borderRadius: 2,
                      borderColor: 'success.200',
                      bgcolor: 'success.50',
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
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary"
                            sx={{ 
                              mb: 0.5,
                              fontSize: {
                                xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                                sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                              },
                              fontWeight: 'bold'
                            }}
                          >
                            Original URL:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              wordBreak: 'break-all',
                              fontSize: {
                                xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                                sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                              },
                              mb: 1,
                              padding: '6px',
                              bgcolor: 'grey.50',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.200'
                            }}
                          >
                            {urlData.original_url}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary"
                            sx={{ 
                              mb: 0.5,
                              fontSize: {
                                xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                                sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                              },
                              fontWeight: 'bold'
                            }}
                          >
                            Shortened URL:
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            flexDirection: { xs: 'column', sm: 'row' },
                            width: '100%',
                            mb: 1
                          }}>
                            <TextField
                              fullWidth
                              value={urlData.short_url}
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
                              onClick={() => copyToClipboard(urlData.short_url)} 
                              sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'white',
                                minWidth: { xs: '100%', sm: 'auto' },
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
                        
                        <Typography 
                          variant="subtitle2" 
                          color="text.secondary"
                          sx={{ 
                            mb: 0.5,
                            fontSize: {
                              xs: 'clamp(0.75rem, 2.2vw, 0.875rem)',
                              sm: 'clamp(0.875rem, 2.5vw, 1rem)'
                            },
                            fontWeight: 'bold'
                          }}
                        >
                          Details:
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap',
                          gap: 1,
                          '& .MuiChip-root': {
                            fontSize: {
                              xs: 'clamp(0.7rem, 2vw, 0.75rem)',
                              sm: 'clamp(0.75rem, 2.2vw, 0.875rem)'
                            }
                          }
                        }}>
                          <Chip
                            icon={<AccessTime />}
                            label={`Created: ${formatDate(urlData.created_at)}`}
                            size="small"
                            sx={{ 
                              bgcolor: 'info.50',
                              color: 'info.main'
                            }}
                          />
                          <Chip
                            icon={<AccessTime />}
                            label={`Expires: ${formatDate(urlData.expires_at)}`}
                            size="small"
                            color="warning"
                            sx={{ 
                              bgcolor: 'warning.50',
                              fontWeight: 'bold'
                            }}
                          />
                          <Chip
                            icon={<LinkIcon />}
                            label={`Code: ${urlData.shortcode}`}
                            size="small"
                            sx={{ 
                              bgcolor: 'primary.100',
                              color: 'primary.main'
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
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

export default URLShortenerPage

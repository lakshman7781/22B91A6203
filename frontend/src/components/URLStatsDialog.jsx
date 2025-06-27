import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ContentCopy,
  Analytics,
  AccessTime,
  Link as LinkIcon,
  Computer,
  PhoneIphone,
  Public
} from '@mui/icons-material';

// Helper functions for formatting user agent information
const getDeviceType = (userAgent) => {
  if (!userAgent) return 'Unknown';
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
    return 'Mobile';
  } else if (ua.includes('tablet')) {
    return 'Tablet';
  } else {
    return 'Desktop';
  }
};

const getBrowser = (userAgent) => {
  if (!userAgent) return 'Unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('firefox')) {
    return 'Firefox';
  } else if (ua.includes('chrome') && !ua.includes('edg')) {
    return 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    return 'Safari';
  } else if (ua.includes('edge') || ua.includes('edg')) {
    return 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    return 'Opera';
  } else if (ua.includes('msie') || ua.includes('trident')) {
    return 'Internet Explorer';
  } else {
    return 'Unknown';
  }
};

const getOperatingSystem = (userAgent) => {
  if (!userAgent) return 'Unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows')) {
    return 'Windows';
  } else if (ua.includes('mac os') || ua.includes('macintosh') || ua.includes('darwin')) {
    return 'macOS';
  } else if (ua.includes('linux') && !ua.includes('android')) {
    return 'Linux';
  } else if (ua.includes('android')) {
    return 'Android';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    return 'iOS';
  } else {
    return 'Unknown';
  }
};

function URLStatsDialog({ open, onClose, urlData, copyToClipboard }) {
  if (!urlData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <LinkIcon /> URL Statistics
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Shortcode:</Typography>
          <Typography variant="h6" fontWeight="bold">{urlData.shortcode}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Original URL:</Typography>
          <Typography 
            variant="body1" 
            sx={{ wordBreak: 'break-all' }}
          >
            {urlData.original_url}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Short URL:</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1">{urlData.short_url}</Typography>
            <IconButton 
              size="small" 
              onClick={() => copyToClipboard(urlData.short_url)}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Click Count:</Typography>
            <Chip
              icon={<Analytics />}
              label={`${urlData.click_count} clicks`}
              color={urlData.click_count > 0 ? "primary" : "default"}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Status:</Typography>
            <Chip
              icon={<AccessTime />}
              label={urlData.is_expired ? 'Expired' : 'Active'}
              color={urlData.is_expired ? "error" : "success"}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Created:</Typography>
            <Typography variant="body2">{formatDate(urlData.created_at)}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Expires:</Typography>
            <Typography variant="body2">{formatDate(urlData.expires_at)}</Typography>
          </Box>
        </Box>
        
        {urlData.click_count > 0 && urlData.click_history && urlData.click_history.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" sx={{ mb: 2 }}>
              Click History
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Device & Browser</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {urlData.click_history.map((click, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{formatDate(click.timestamp)}</TableCell>
                      <TableCell>
                        <Tooltip title="IP Address" placement="top" arrow>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Public fontSize="small" color="action" />
                            <span>{click.ip_address || 'Unknown'}</span>
                            {click.ip_address && (
                              <IconButton 
                                size="small" 
                                onClick={() => copyToClipboard(click.ip_address)}
                                sx={{ padding: '2px', ml: 1 }}
                              >
                                <ContentCopy fontSize="small" sx={{ fontSize: '0.85rem' }} />
                              </IconButton>
                            )}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {click.user_agent ? (
                          <Tooltip
                            title={<Typography variant="caption">{click.user_agent}</Typography>}
                            placement="top"
                            arrow
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getDeviceType(click.user_agent) === 'Mobile' ? (
                                <PhoneIphone fontSize="small" color="primary" />
                              ) : (
                                <Computer fontSize="small" color="primary" />
                              )}
                              <span>
                                <b>{getBrowser(click.user_agent)}</b> on {getOperatingSystem(click.user_agent)}
                              </span>
                            </Box>
                          </Tooltip>
                        ) : (
                          'Unknown'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          variant="contained" 
          onClick={onClose} 
          fullWidth
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default URLStatsDialog;

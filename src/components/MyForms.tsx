import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  List, ListItem, ListItemText, Button, Typography, Container, 
  Card, CardContent, Box, Paper, Chip, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { SavedForm } from './types';

const MyForms: React.FC = () => {
  const navigate = useNavigate();
  const { savedForms } = useSelector((state: any) => state.form);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Box>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              📋 My Forms
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage and preview your created forms
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/create')}
            startIcon={<AddIcon />}
            sx={{
              px: 3,
              py: 1.5,
              mt: { xs: 2, sm: 0 },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Create New Form
          </Button>
        </Box>
      </Paper>

      {savedForms.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No forms created yet
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Start building your first form to see it here
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/create')}
                startIcon={<AddIcon />}
                size="large"
              >
                Create Your First Form
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {savedForms.map((form: SavedForm) => (
            <Card 
              key={form.id}
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {form.name}
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={`${form.schema.fields.length} fields`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created: {format(new Date(form.createdAt), 'MMM dd, yyyy')}
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(form.createdAt), 'hh:mm a')}
                </Typography>
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate(`/preview/${form.id}`)}
                  startIcon={<VisibilityIcon />}
                  sx={{
                    '&:hover': {
                      boxShadow: 3,
                    },
                  }}
                >
                  Preview Form
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default MyForms;

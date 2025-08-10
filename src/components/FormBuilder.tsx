import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, TextField, Select, MenuItem, FormControlLabel, Switch, List, ListItem, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Typography,
  Container, Card, CardContent, Box, Divider, FormControl, InputLabel,
  Paper, Stack
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import { addField, updateField, deleteField, reorderFields, saveForm, resetCurrentForm } from './redux/formSlice';
import { Field, FieldType, ValidationRule } from './types';
import { v4 as uuidv4 } from 'uuid';

const fieldTypes: FieldType[] = ['text', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date'];

const fieldIcons = {
  text: '📝',
  number: '🔢',
  textarea: '📄',
  select: '📋',
  radio: '⚪',
  checkbox: '☑️',
  date: '📅'
};

const FormBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const { currentForm } = useSelector((state: any) => state.form);
  const [openConfig, setOpenConfig] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [fieldConfig, setFieldConfig] = useState<Partial<Field>>({});
  const [saveName, setSaveName] = useState('');
  const [openSave, setOpenSave] = useState(false);

  const handleAddField = (type: FieldType) => {
    const newField: Field = {
      id: uuidv4(),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      validations: [],
    };
    dispatch(addField(newField));
  };

  const openFieldConfig = (index: number) => {
    setSelectedIndex(index);
    setFieldConfig({ ...currentForm.fields[index] });
    setOpenConfig(true);
  };

  const handleConfigChange = (key: keyof Field, value: any) => {
    setFieldConfig((prev) => ({ ...prev, [key]: value }));
  };

  const addValidation = (rule: ValidationRule) => {
    setFieldConfig((prev) => ({ 
      ...prev, 
      validations: [...(prev.validations || []), rule] 
    }));
  };

  const removeValidation = (index: number) => {
    setFieldConfig((prev) => ({
      ...prev,
      validations: (prev.validations || []).filter((_, i) => i !== index)
    }));
  };

  const saveConfig = () => {
    if (selectedIndex !== null) {
      dispatch(updateField({ index: selectedIndex, field: fieldConfig }));
    }
    setOpenConfig(false);
    setFieldConfig({});
  };

  const handleSaveForm = () => {
    if (saveName.trim()) {
      dispatch(saveForm(saveName));
      setOpenSave(false);
      setSaveName('');
      dispatch(resetCurrentForm());
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          🛠️ Form Builder
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Create dynamic forms with custom fields and validations
        </Typography>
      </Paper>

      {/* Add Field Buttons - FIXED GRID */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Add New Fields</Typography>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
            {fieldTypes.map((type) => (
              <Button
                key={type}
                fullWidth
                variant="outlined"
                onClick={() => handleAddField(type)}
                startIcon={<span style={{ fontSize: '1.2em' }}>{fieldIcons[type]}</span>}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Form Fields List */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Form Fields ({currentForm.fields.length})</Typography>
          {currentForm.fields.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                No fields added yet. Add some fields to get started!
              </Typography>
            </Box>
          ) : (
            <List>
              {currentForm.fields.map((field: Field, index: number) => (
                <ListItem
                  key={field.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {fieldIcons[field.type]} {field.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {field.type} • {field.required ? 'Required' : 'Optional'}
                        {field.derived && ' • Derived'}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        onClick={() => openFieldConfig(index)}
                        color="primary"
                        size="small"
                      >
                        <SettingsIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => dispatch(deleteField(index))}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        disabled={index === 0}
                        onClick={() => dispatch(reorderFields({ oldIndex: index, newIndex: index - 1 }))}
                        size="small"
                      >
                        <ArrowUpwardIcon />
                      </IconButton>
                      <IconButton
                        disabled={index === currentForm.fields.length - 1}
                        onClick={() => dispatch(reorderFields({ oldIndex: index, newIndex: index + 1 }))}
                        size="small"
                      >
                        <ArrowDownwardIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Save Form Button */}
      <Box textAlign="center">
        <Button
          variant="contained"
          size="large"
          onClick={() => setOpenSave(true)}
          disabled={!currentForm.fields.length}
          startIcon={<SaveIcon />}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Save Form
        </Button>
      </Box>

      {/* Field Configuration Dialog */}
      <Dialog open={openConfig} onClose={() => setOpenConfig(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Configure Field: {fieldConfig.label}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Field Label"
              fullWidth
              value={fieldConfig.label || ''}
              onChange={(e) => handleConfigChange('label', e.target.value)}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={fieldConfig.required || false}
                  onChange={(e) => handleConfigChange('required', e.target.checked)}
                />
              }
              label="Required Field"
            />
            
            <TextField
              label="Default Value"
              fullWidth
              value={fieldConfig.defaultValue || ''}
              onChange={(e) => handleConfigChange('defaultValue', e.target.value)}
            />

            {/* Options for select/radio/checkbox */}
            {['select', 'radio', 'checkbox'].includes(fieldConfig.type || '') && (
              <TextField
                label="Options (comma-separated)"
                fullWidth
                helperText="e.g., Option 1, Option 2, Option 3"
                onChange={(e) => handleConfigChange('options', e.target.value.split(',').map(s => s.trim()))}
              />
            )}

            <Divider />

            {/* Validations - FIXED GRID */}
            <Box>
              <Typography variant="h6" gutterBottom>Validation Rules</Typography>
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                  mb: 2
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addValidation({ type: 'required', message: 'This field is required' })}
                >
                  Required
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addValidation({ type: 'minLength', value: 5, message: 'Minimum 5 characters' })}
                >
                  Min Length
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addValidation({ type: 'maxLength', value: 20, message: 'Maximum 20 characters' })}
                >
                  Max Length
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addValidation({ type: 'email', message: 'Invalid email format' })}
                >
                  Email Format
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addValidation({ type: 'password', message: 'Min 8 chars with number' })}
                >
                  Password Rule
                </Button>
              </Box>

              {/* Current Validations */}
              {(fieldConfig.validations || []).length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Current Validations:</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {(fieldConfig.validations || []).map((v, i) => (
                      <Chip
                        key={i}
                        label={v.message}
                        onDelete={() => removeValidation(i)}
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Derived Field */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={fieldConfig.derived || false}
                    onChange={(e) => handleConfigChange('derived', e.target.checked)}
                  />
                }
                label="Derived Field"
              />
              
              {fieldConfig.derived && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Parent Fields</InputLabel>
                    <Select
                      multiple
                      value={fieldConfig.parentFields || []}
                      onChange={(e) => handleConfigChange('parentFields', e.target.value as number[])}
                      label="Parent Fields"
                    >
                      {currentForm.fields.map((f: Field, i: number) => (
                        <MenuItem key={i} value={i}>
                          {f.label} ({f.type})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Formula"
                    fullWidth
                    multiline
                    rows={3}
                    value={fieldConfig.formula || ''}
                    onChange={(e) => handleConfigChange('formula', e.target.value)}
                    helperText="Use parent0, parent1, etc. Example for age: Math.floor((new Date() - new Date(parent0)) / (365.25*24*60*60*1000))"
                  />
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfig(false)}>Cancel</Button>
          <Button onClick={saveConfig} variant="contained">Save Configuration</Button>
        </DialogActions>
      </Dialog>

      {/* Save Form Dialog */}
      <Dialog open={openSave} onClose={() => setOpenSave(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Form</DialogTitle>
        <DialogContent>
          <TextField
            label="Form Name"
            fullWidth
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            sx={{ mt: 2 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSave(false)}>Cancel</Button>
          <Button onClick={handleSaveForm} variant="contained" disabled={!saveName.trim()}>
            Save Form
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FormBuilder;

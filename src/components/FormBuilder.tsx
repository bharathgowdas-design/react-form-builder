import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button, TextField, Select, MenuItem, FormControlLabel, Switch, List, ListItem, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Typography,
  Container, Card, CardContent, Box, Divider, FormControl, InputLabel,
  Paper, Stack, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { addField, updateField, deleteField, reorderFields, saveForm, resetCurrentForm } from './redux/formSlice';
import { Field, FieldType, ValidationRule } from './types';
import { v4 as uuidv4 } from 'uuid';

const fieldTypes: FieldType[] = ['text', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date'];

const fieldIcons: Record<FieldType, string> = {
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
  const navigate = useNavigate();
  const { currentForm } = useSelector((state: any) => state.form);
  const [openConfig, setOpenConfig] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [fieldConfig, setFieldConfig] = useState<Partial<Field>>({});
  const [saveName, setSaveName] = useState<string>('');
  const [openSave, setOpenSave] = useState<boolean>(false);
  const [configErrors, setConfigErrors] = useState<string[]>([]);

  // Safety check for currentForm
  if (!currentForm) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Loading form builder...
          </Typography>
        </Paper>
      </Container>
    );
  }

  const handleAddField = (type: FieldType): void => {
    const newField: Field = {
      id: uuidv4(),
      type,
      label: '', // Empty label so user must set it
      required: false,
      validations: [],
    };
    dispatch(addField(newField));
  };

  const openFieldConfig = (index: number): void => {
    setSelectedIndex(index);
    setFieldConfig({ ...currentForm.fields[index] });
    setOpenConfig(true);
    setConfigErrors([]);
  };

  const handleConfigChange = (key: keyof Field, value: any): void => {
    setFieldConfig((prev) => ({ ...prev, [key]: value }));
    // Clear errors when user starts typing
    if (configErrors.length > 0) {
      setConfigErrors([]);
    }
  };

  const addValidation = (rule: ValidationRule): void => {
    const exists = fieldConfig.validations?.some(v => v.type === rule.type);
    if (!exists) {
      setFieldConfig((prev) => ({ 
        ...prev, 
        validations: [...(prev.validations || []), rule] 
      }));
    }
  };

  const removeValidation = (index: number): void => {
    setFieldConfig((prev) => ({
      ...prev,
      validations: (prev.validations || []).filter((_, i) => i !== index)
    }));
  };

  const validateFieldConfig = (): boolean => {
    const errors: string[] = [];
    
    if (!fieldConfig.label || fieldConfig.label.trim() === '') {
      errors.push('Field label is required');
    }
    
    if (['select', 'radio', 'checkbox'].includes(fieldConfig.type || '') && 
        (!fieldConfig.options || fieldConfig.options.length === 0)) {
      errors.push('Options are required for this field type');
    }

    if (fieldConfig.derived) {
      if (!fieldConfig.parentFields || fieldConfig.parentFields.length === 0) {
        errors.push('Parent fields are required for derived fields');
      }
      if (!fieldConfig.formula || fieldConfig.formula.trim() === '') {
        errors.push('Formula is required for derived fields');
      }
    }

    setConfigErrors(errors);
    return errors.length === 0;
  };

  const saveConfig = (): void => {
    if (!validateFieldConfig()) {
      return;
    }

    if (selectedIndex !== null) {
      dispatch(updateField({ index: selectedIndex, field: fieldConfig }));
    }
    setOpenConfig(false);
    setFieldConfig({});
    setConfigErrors([]);
  };

  const handleSaveForm = (): void => {
    if (saveName.trim()) {
      dispatch(saveForm(saveName));
      setOpenSave(false);
      setSaveName('');
      dispatch(resetCurrentForm());
      navigate('/myforms'); // Navigate back to forms list
    }
  };

  const getAvailableParentFields = (): Field[] => {
    if (selectedIndex === null || !currentForm?.fields || !Array.isArray(currentForm.fields)) {
      return [];
    }
    
    // Only show fields that come before the current field and are not derived themselves
    return currentForm.fields
      .slice(0, selectedIndex)
      .filter((field: Field | undefined): field is Field => {
        return field !== undefined && 
               field !== null && 
               !field.derived && 
               Boolean(field.label?.trim());
      });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              🛠️ Form Builder
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Create dynamic forms with custom fields and validations
            </Typography>
          </Box>
          {/* Back Button */}
          <Button
            variant="outlined"
            onClick={() => navigate('/myforms')}
            startIcon={<ArrowBackIcon />}
            sx={{ mt: { xs: 2, sm: 0 } }}
          >
            Back to My Forms
          </Button>
        </Box>
      </Paper>

      {/* Add Field Buttons */}
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
          <Typography variant="h6" gutterBottom>Form Fields ({currentForm.fields?.length || 0})</Typography>
          {!currentForm.fields || currentForm.fields.length === 0 ? (
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
                        {fieldIcons[field.type]} {field.label || `Untitled ${field.type} field`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {field.type} • {field.required ? 'Required' : 'Optional'}
                        {field.derived && ' • Derived'}
                        {!field.label && ' • Label Required'}
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
          disabled={!currentForm.fields?.length || currentForm.fields?.some((field: Field) => !field.label)}
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
        {currentForm.fields?.some((field: Field) => !field.label) && (
          <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
            All fields must have labels before saving
          </Typography>
        )}
      </Box>

      {/* Field Configuration Dialog */}
      <Dialog open={openConfig} onClose={() => setOpenConfig(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Configure Field: Configure Field: {fieldConfig.type ? fieldConfig.type.charAt(0).toUpperCase() + fieldConfig.type.slice(1) : 'Unknown'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Show validation errors */}
            {configErrors.length > 0 && (
              <Alert severity="error">
                <Typography variant="subtitle2" gutterBottom>Please fix the following errors:</Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {configErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <TextField
              label="Field Label"
              fullWidth
              value={fieldConfig.label || ''}
              onChange={(e) => handleConfigChange('label', e.target.value)}
              placeholder={`Enter label for ${fieldConfig.type} field`}
              required
              error={configErrors.some(error => error.includes('label'))}
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
              placeholder="Enter default value (optional)"
            />

            {/* Options for select/radio/checkbox */}
            {['select', 'radio', 'checkbox'].includes(fieldConfig.type || '') && (
              <TextField
                label="Options (comma-separated)"
                fullWidth
                helperText="e.g., Option 1, Option 2, Option 3"
                onChange={(e) => handleConfigChange('options', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                placeholder="Enter options separated by commas"
                required
                error={configErrors.some(error => error.includes('Options'))}
              />
            )}

            <Divider />

            {/* Validations */}
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
                  disabled={fieldConfig.validations?.some(v => v.type === 'required')}
                >
                  Required
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addValidation({ type: 'minLength', value: 5, message: 'Minimum 5 characters' })}
                  disabled={fieldConfig.validations?.some(v => v.type === 'minLength')}
                >
                  Min Length
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addValidation({ type: 'maxLength', value: 20, message: 'Maximum 20 characters' })}
                  disabled={fieldConfig.validations?.some(v => v.type === 'maxLength')}
                >
                  Max Length
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addValidation({ type: 'email', message: 'Invalid email format' })}
                  disabled={fieldConfig.validations?.some(v => v.type === 'email')}
                >
                  Email Format
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addValidation({ type: 'password', message: 'Min 8 chars with number' })}
                  disabled={fieldConfig.validations?.some(v => v.type === 'password')}
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

            {/* Derived Field - FIXED VERSION */}
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
                  <Alert severity="info">
                    <Typography variant="body2">
                      Derived fields automatically calculate their value based on other fields. 
                      Select parent fields and define a formula using parent0, parent1, etc.
                    </Typography>
                  </Alert>

                  <FormControl fullWidth error={configErrors.some(error => error.includes('Parent'))}>
                    <InputLabel>Parent Fields</InputLabel>
                    <Select
                      multiple
                      value={fieldConfig.parentFields || []}
                      onChange={(e) => handleConfigChange('parentFields', e.target.value as number[])}
                      label="Parent Fields"
                    >
                      {getAvailableParentFields().map((f: Field) => {
                        if (!f || !f.id) return null; // Safety check
                        
                        const actualIndex = currentForm?.fields?.findIndex((field: Field) => field?.id === f.id);
                        
                        if (actualIndex === undefined || actualIndex === -1) return null;
                        
                        return (
                          <MenuItem key={f.id} value={actualIndex}>
                            {f.label || `${f.type || 'Unknown'} field`} ({f.type || 'unknown'})
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Formula"
                    fullWidth
                    multiline
                    rows={3}
                    value={fieldConfig.formula || ''}
                    onChange={(e) => handleConfigChange('formula', e.target.value)}
                    placeholder="parent0 + parent1"
                    helperText="Examples: parent0 + parent1 | Math.floor((new Date() - new Date(parent0)) / (365.25*24*60*60*1000)) | parent0.length"
                    error={configErrors.some(error => error.includes('Formula'))}
                  />

                  {/* Formula Examples */}
                  <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Common Formula Examples:</Typography>
                    <Typography variant="caption" display="block">• Age from DOB: Math.floor((new Date() - new Date(parent0)) / (365.25*24*60*60*1000))</Typography>
                    <Typography variant="caption" display="block">• Sum two numbers: parent0 + parent1</Typography>
                    <Typography variant="caption" display="block">• Full name: parent0 + ' ' + parent1</Typography>
                    <Typography variant="caption" display="block">• Text length: parent0.length</Typography>
                  </Box>
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
            placeholder="Enter a name for your form"
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

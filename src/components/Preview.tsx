import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField, Checkbox, FormControlLabel, Select, MenuItem, RadioGroup, 
  Radio, FormLabel, Typography, Button, Container, Paper, Box, 
  Card, CardContent, Stack, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { loadFormForPreview } from './redux/formSlice';
import { Field as FieldType } from './types';

const Preview: React.FC = () => {
  const { formId } = useParams<{ formId?: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentForm } = useSelector((state: any) => state.form);

  useEffect(() => {
    if (formId) {
      dispatch(loadFormForPreview(formId));
    }
  }, [formId, dispatch]);

  // Build Yup schema dynamically
  const validationSchema = yup.object().shape(
    currentForm.fields.reduce((acc: { [key: string]: yup.AnySchema }, field: FieldType, index: number) => {
      let schema: yup.AnySchema = ['number'].includes(field.type) ? yup.number() : yup.string();
      
      if (field.required) {
        schema = schema.required(field.validations.find(v => v.type === 'required')?.message || 'This field is required');
      }
      
      field.validations.forEach((v) => {
        if (v.type === 'minLength' && schema instanceof yup.StringSchema) {
          schema = schema.min(v.value as number, v.message);
        }
        if (v.type === 'maxLength' && schema instanceof yup.StringSchema) {
          schema = schema.max(v.value as number, v.message);
        }
        if (v.type === 'email' && schema instanceof yup.StringSchema) {
          schema = schema.email(v.message);
        }
        if (v.type === 'password' && schema instanceof yup.StringSchema) {
          schema = schema.matches(/^(?=.*\d).{8,}$/, v.message);
        }
      });
      
      acc[`field${index}`] = schema.nullable();
      return acc;
    }, {})
  );

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const formValues = watch();

  useEffect(() => {
    currentForm.fields.forEach((field: FieldType, index: number) => {
      if (field.derived && field.parentFields && field.formula) {
        try {
          const parents = field.parentFields.map((pIdx) => formValues[`field${pIdx}`] || '');
          const evalFormula = field.formula.replace(/parent(\d+)/g, (_, i) => `parents[${i}]`);
          const computed = eval(`(parents) => ${evalFormula}`)(parents);
          setValue(`field${index}`, computed);
        } catch (e) {
          console.error('Formula error:', e);
        }
      }
    });
  }, [formValues, currentForm.fields, setValue]);

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
    alert('Form submitted successfully! Check console for data.');
  };

  const renderField = (field: FieldType, index: number) => {
    const name = `field${index}`;
    const error = !!errors[name];
    const helperText = errors[name]?.message as string;

    switch (field.type) {
      case 'text':
      case 'number':
      case 'textarea':
        return (
          <Controller
            name={name}
            control={control}
            defaultValue={field.defaultValue}
            render={({ field: f }) => (
              <TextField
                {...f}
                label={field.label}
                type={field.type === 'number' ? 'number' : 'text'}
                multiline={field.type === 'textarea'}
                rows={field.type === 'textarea' ? 4 : 1}
                error={error}
                helperText={helperText}
                fullWidth
                required={field.required}
                disabled={field.derived}
              />
            )}
          />
        );
      
      case 'select':
        return (
          <Controller
            name={name}
            control={control}
            defaultValue={field.defaultValue || ''}
            render={({ field: f }) => (
              <TextField
                {...f}
                select
                label={field.label}
                error={error}
                helperText={helperText}
                fullWidth
                required={field.required}
              >
                {field.options?.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        );
      
      case 'radio':
        return (
          <Box>
            <FormLabel component="legend" required={field.required}>
              {field.label}
            </FormLabel>
            <Controller
              name={name}
              control={control}
              defaultValue={field.defaultValue}
              render={({ field: f }) => (
                <RadioGroup {...f} row>
                  {field.options?.map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              )}
            />
            {error && (
              <Typography variant="caption" color="error">
                {helperText}
              </Typography>
            )}
          </Box>
        );
      
      case 'checkbox':
        return (
          <Controller
            name={name}
            control={control}
            defaultValue={field.defaultValue || false}
            render={({ field: f }) => (
              <FormControlLabel
                control={<Checkbox {...f} checked={!!f.value} />}
                label={field.label}
                required={field.required}
              />
            )}
          />
        );
      
      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
              name={name}
              control={control}
              defaultValue={field.defaultValue ? new Date(field.defaultValue as string) : null}
              render={({ field: f }) => (
                <DatePicker
                  label={field.label}
                  {...f}
                  onChange={(date) => f.onChange(date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: error,
                      helperText: helperText,
                      required: field.required,
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        );
      
      default:
        return null;
    }
  };

  if (!currentForm.name) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Form not found or loading...
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/myforms')}
            sx={{ mt: 2 }}
          >
            Back to My Forms
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Box>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              👀 {currentForm.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Form Preview - Fill out the form below
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/myforms')}
            startIcon={<ArrowBackIcon />}
            sx={{ mt: { xs: 2, sm: 0 } }}
          >
            Back to Forms
          </Button>
        </Box>
      </Paper>

      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* FIXED - Removed Grid, using Stack instead */}
            <Stack spacing={3}>
              {currentForm.fields.map((field: FieldType, index: number) => (
                <Box key={field.id}>
                  {renderField(field, index)}
                  {field.derived && (
                    <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                      🔄 This field is automatically calculated
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 4 }} />

            <Box textAlign="center">
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SendIcon />}
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
                Submit Form
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Preview;

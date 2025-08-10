export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'email' | 'password';
  value?: number | string;
  message: string;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: string | number | boolean | string[];
  options?: string[]; // For select, radio, checkbox
  validations: ValidationRule[];
  derived?: boolean;
  parentFields?: number[]; // Indices of parent fields
  formula?: string; // Simple JS expression, e.g., "Math.floor((new Date() - new Date(parent0)) / (365.25*24*60*60*1000))"
}

export interface FormSchema {
  id: string;
  name: string;
  fields: Field[];
}

export interface SavedForm {
  id: string;
  name: string;
  createdAt: string;
  schema: FormSchema;
}

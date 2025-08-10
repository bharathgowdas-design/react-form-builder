import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FormSchema, Field, SavedForm } from '../types';

interface FormState {
  currentForm: FormSchema;
  savedForms: SavedForm[];
}

const initialState: FormState = {
  currentForm: { id: '', name: '', fields: [] },
  savedForms: JSON.parse(localStorage.getItem('savedForms') || '[]'),
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    addField: (state, action: PayloadAction<Field>) => {
      state.currentForm.fields.push(action.payload);
    },
    updateField: (state, action: PayloadAction<{ index: number; field: Partial<Field> }>) => {
      const { index, field } = action.payload;
      state.currentForm.fields[index] = { ...state.currentForm.fields[index], ...field };
    },
    deleteField: (state, action: PayloadAction<number>) => {
      state.currentForm.fields.splice(action.payload, 1);
      // Clean up derived refs if parent deleted
      state.currentForm.fields.forEach((f) => {
        if (f.derived && f.parentFields?.includes(action.payload)) {
          f.parentFields = f.parentFields.filter((p) => p !== action.payload);
        }
      });
    },
    reorderFields: (state, action: PayloadAction<{ oldIndex: number; newIndex: number }>) => {
      const [moved] = state.currentForm.fields.splice(action.payload.oldIndex, 1);
      state.currentForm.fields.splice(action.payload.newIndex, 0, moved);
    },
    saveForm: (state, action: PayloadAction<string>) => {
      const formId = Date.now().toString();
      const newForm: SavedForm = {
        id: formId,
        name: action.payload,
        createdAt: new Date().toISOString(), // Use current date for creation
        schema: { ...state.currentForm, id: formId, name: action.payload },
      };
      state.savedForms.push(newForm);
      localStorage.setItem('savedForms', JSON.stringify(state.savedForms));
      state.currentForm = { id: '', name: '', fields: [] }; // Reset
    },
    loadFormForPreview: (state, action: PayloadAction<string>) => {
      const form = state.savedForms.find((f) => f.id === action.payload);
      if (form) {
        state.currentForm = form.schema;
      }
    },
    resetCurrentForm: (state) => {
      state.currentForm = { id: '', name: '', fields: [] };
    },
  },
});

export const {
  addField,
  updateField,
  deleteField,
  reorderFields,
  saveForm,
  loadFormForPreview,
  resetCurrentForm,
} = formSlice.actions;
export default formSlice.reducer;

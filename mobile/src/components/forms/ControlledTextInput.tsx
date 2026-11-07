import React from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { AppInput } from '../common/AppInput';

interface ControlledTextInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  secureTextEntry?: boolean;
}

export const ControlledTextInput = <T extends FieldValues>({ control, name, label, secureTextEntry }: ControlledTextInputProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { onChange, value }, fieldState: { error } }) => (
      <AppInput label={label} value={value as string | undefined} onChangeText={onChange} error={error?.message} secureTextEntry={secureTextEntry} />
    )}
  />
);

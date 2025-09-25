import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import CustomInput from '../../customs/input';

type Props = {};

function FeatureInput() {
  const { control, register } = useForm();
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control, // control props comes from useForm (optional: if you are using FormContext)
      name: 'test', // unique name for your Field Array
    },
  );

  return (
    <section>
      {fields.map((field, index) => (
        <CustomInput
          {...register(`test.${index}.value`)}
          label='name'
          key={field.id} // important to include key with field's id
        />
      ))}
    </section>
  );
}
export default FeatureInput;

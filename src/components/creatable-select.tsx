
'use client';

import CreatableSelect from 'react-select/creatable';
import { type GroupBase, type Props } from 'react-select';

// This is a workaround for the fact that react-select is not yet fully compatible with React 18.
// We can remove this once the library is updated.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Creatable = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: Props<Option, IsMulti, Group>
) => {
  return (
      <CreatableSelect
        {...props}
        styles={{
            control: (base) => ({
                ...base,
                backgroundColor: 'transparent',
                borderColor: 'hsl(var(--input))',
            }),
            input: (base) => ({
                ...base,
                color: 'hsl(var(--foreground))',
            }),
            menu: (base) => ({
                ...base,
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
            }),
            option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected ? 'hsl(var(--primary))' : isFocused ? 'hsl(var(--accent))' : 'transparent',
                color: isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                '&:active': {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                }
            }),
            singleValue: (base) => ({
                ...base,
                color: 'hsl(var(--foreground))',
            }),
             multiValue: (base) => ({
                ...base,
                backgroundColor: 'hsl(var(--secondary))',
            }),
            multiValueLabel: (base) => ({
                ...base,
                color: 'hsl(var(--secondary-foreground))',
            }),
            multiValueRemove: (base) => ({
                ...base,
                color: 'hsl(var(--secondary-foreground))',
                ':hover': {
                    backgroundColor: 'hsl(var(--destructive))',
                    color: 'hsl(var(--destructive-foreground))',
                }
            }),
        }}
      />
  );
};

export { Creatable as CreatableSelect };


import { useFormContext } from "@/context";
import { Controller, Path } from "react-hook-form";
import { Text, View, FocusableView, TextInput } from "@/components";

export function FormField<T extends Record<string, any>>({
  label,
  name,
  secureTextEntry = false,
  showLabel = false,
  className = "",
  style = {},
  ...props
}: {
  label: string;
  name: Path<T>;
  secureTextEntry?: boolean;
  showLabel?: boolean;
  className?: string;
  style?: any;
  [key: string]: any;
}) {
  const { control, formState: errors } = useFormContext<T>();

  const hasError = !!errors[name];

  let errorMessage = "";

  if (errors[name]) {
    errorMessage = errors[name][0] || "Error with input format";
  }

  return (
    <FocusableView focusKey={String(name)} className="mb-4">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <TextInput
            className={hasError ? "border-red-500" : "border-neutral-400"}
            label={label}
            selectionColor="#000"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry={secureTextEntry}
            ref={ref}
            {...props}
          />
        )}
      />
      <View style={{ marginTop: 4 }}>
        {hasError && errorMessage && (
          <Text style={{ color: "#ef4444" }}>
            {errorMessage || "Invalid input"}
          </Text>
        )}
      </View>
    </FocusableView>
  );
}

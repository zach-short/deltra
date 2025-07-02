import { FormProvider } from "@/context";
import { ReactNode } from "react";
import { FieldValues, UseFormProps, SubmitHandler } from "react-hook-form";
import { ZodSchema } from "zod";
import { View } from "../ui";

interface FormProps<T extends FieldValues> {
  children: ReactNode;
  schema: ZodSchema<T>;
  defaultValues: UseFormProps<T>["defaultValues"];
  onSubmit: SubmitHandler<T>;
  className?: string;
}

export function Form<T extends FieldValues>({
  children,
  schema,
  defaultValues,
  onSubmit,
  className,
}: FormProps<T>) {
  return (
    <FormProvider
      schema={schema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    >
      <View className={className}>{children}</View>
    </FormProvider>
  );
}

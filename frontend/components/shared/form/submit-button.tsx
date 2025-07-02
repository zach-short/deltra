import { useFormContext } from "@/context";
import { FieldValues } from "react-hook-form";
import { Pressable } from "../ui";

interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export function SubmitButton<T extends FieldValues>({
  label,
  loadingLabel,
  loading = false,
  className = "h-14 rounded-md flex flex-row items-center justify-center bg-black mt-2",
  textClassName = "text-center text-white",
}: SubmitButtonProps) {
  const { submitForm } = useFormContext<T>();

  return (
    <Pressable
      className={className}
      onPress={() => {
        submitForm();
      }}
      textProps={{ className: textClassName }}
    >
      {loading ? loadingLabel || `$label...` : label}
    </Pressable>
  );
}

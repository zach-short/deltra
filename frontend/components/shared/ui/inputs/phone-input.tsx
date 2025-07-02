import { TextInput } from '@/components';

export function PhoneInput({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (a: string, b: string) => void;
}) {
  const displayValue = formatPhoneNumber(value || '');

  const handleChangeText = (text: string) => {
    const formattedNumber = formatPhoneNumber(text);
    onChangeText(formattedNumber, getDigitsOnly(formattedNumber));
  };

  return (
    <TextInput
      value={displayValue}
      onChangeText={handleChangeText}
      label='Phone Number'
      keyboardType='phone-pad'
      maxLength={14}
    />
  );
}

export const formatPhoneNumber = (text?: string): string => {
  if (!text) {
    return '';
  }
  const cleaned = text.replace(/\D/g, '');
  const limited = cleaned.substring(0, 10);

  let formatted = '';
  if (limited.length > 0) {
    formatted += '(' + limited.substring(0, 3);

    if (limited.length > 3) {
      formatted += ') ' + limited.substring(3, 6);

      if (limited.length > 6) {
        formatted += '-' + limited.substring(6, 10);
      }
    }
  }

  return formatted;
};

export const getDigitsOnly = (phoneNumber?: string) => {
  return phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
};

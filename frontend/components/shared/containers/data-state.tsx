import { SafeAreaView } from '@/components';
import { Fallback } from '../fallbacks';
import { LoadingDots } from '../loading-states';

type DataStateProps<T> = {
  data: T | null;
  loading: boolean;
  error: any;
  refetch?: () => void;
  LoadingComponent?: React.ComponentType;
  ErrorComponent?: React.ComponentType<{ error: any; onRetry?: () => void }>;
  EmptyComponent?: React.ComponentType;
  children: (data: T) => React.ReactNode;
  isEmpty?: (data: T) => boolean;
  validate?: (data: T) => { isValid: boolean; error?: any };
};

export function DataState<T>({
  data,
  loading,
  error,
  refetch,
  LoadingComponent = DefaultLoadingComponent,
  ErrorComponent = Fallback,
  EmptyComponent = Fallback,
  children,
  isEmpty = (data) => !data || (Array.isArray(data) && data.length === 0),
  validate,
}: DataStateProps<T>) {
  if (loading) return <LoadingComponent />;

  if (error) {
    return <ErrorComponent error={error} onRetry={refetch} />;
  }

  if (isEmpty(data)) {
    return <EmptyComponent />;
  }

  if (validate) {
    const validationResult = validate(data);
    if (!validationResult.isValid) {
      return (
        <ErrorComponent
          error={
            validationResult.error || { status: 400, message: 'Invalid data' }
          }
          onRetry={refetch}
        />
      );
    }
  }

  return <>{children(data)}</>;
}

export const DefaultLoadingComponent = () => {
  return (
    <SafeAreaView className={`flex-1 bg-white justify-center items-center`}>
      <LoadingDots />
    </SafeAreaView>
  );
};

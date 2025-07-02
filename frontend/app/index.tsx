import { useAuth } from '@/context/auth';
import { LoadingDots, PortfolioManager, View } from '@/components';
import LoginForm from '@/components/auth';

export default function HomeScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingDots />
      </View>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <PortfolioManager />;
}

import { View, Text, Pressable, fonts, Icon } from '@/components';
import { StyleSheet } from 'react-native';
import { Stock } from '@/models';
import { DeleteIcon } from '@/icons';

interface StockListItemProps {
  stock: Stock;
  onPress: () => void;
  onDelete: () => void;
  isLast?: boolean;
}

export function StockListItem({
  stock,
  onPress,
  onDelete,
  isLast,
}: StockListItemProps) {
  const totalValue = stock.shares * stock.basis;

  return (
    <Pressable
      style={[styles.container, !isLast && styles.borderBottom]}
      onPress={onPress}
      wrapInText={false}
    >
      <View style={styles.leftSection}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbol}>{stock.symbol}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.shares}>
            {stock.shares} {stock.shares === 1 ? 'share' : 'shares'}
          </Text>
          <Text style={styles.basis}>${stock.basis.toFixed(2)} avg cost</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.totalValue}>${totalValue.toFixed(2)}</Text>
        <Text style={styles.viewMore}>View details →</Text>
      </View>

      <Pressable
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        wrapInText={false}
      >
        <Icon icon={DeleteIcon} size={16} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 200, 5, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  symbol: {
    color: '#00C805',
    fontSize: 14,
    fontFamily: fonts.interBold,
  },
  details: {
    flex: 1,
  },
  shares: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
    marginBottom: 2,
  },
  basis: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 14,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interBold,
    marginBottom: 2,
  },
  viewMore: {
    color: '#00C805',
    fontSize: 12,
    opacity: 0.8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  deleteIcon: {
    fontSize: 14,
  },
});

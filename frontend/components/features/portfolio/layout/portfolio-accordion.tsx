import { useState } from 'react';
import { View, Text, fonts, Icon, Pressable, TextInput } from '@/components';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Portfolio, Stock } from '@/models';
import { StockListItem } from './stock-list-item';
import { DeleteIcon, PencilIcon } from '@/icons';

interface PortfolioAccordionProps {
  portfolio: Portfolio;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (name: string) => void;
  onCancel: () => void;
  onDelete: (portfolioId: string) => void;
  onStockPress: (stock: Stock) => void;
  onStockDelete: (stockId: string) => void;
  loading: boolean;
}

export function PortfolioAccordion({
  portfolio,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onStockPress,
  onStockDelete,
  loading,
}: PortfolioAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editName, setEditName] = useState(portfolio.name);
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useSharedValue(0);
  const rotateValue = useSharedValue(0);

  const stocks = portfolio.stocks || [];
  const stockCount = stocks.length;

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    animatedHeight.value = withTiming(newExpanded ? contentHeight : 0, {
      duration: 300,
    });

    rotateValue.value = withTiming(newExpanded ? 1 : 0, {
      duration: 300,
    });
  };

  const heightStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: 'hidden',
  }));

  const handleContentLayout = (event: any) => {
    const height = event.nativeEvent.layout.height;
    setContentHeight(height);
    if (isExpanded && animatedHeight.value === 0) {
      animatedHeight.value = height;
    }
  };

  if (isEditing) {
    return (
      <View style={styles.portfolioCard}>
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editName}
            onChangeText={setEditName}
            placeholder='Portfolio name'
            autoFocus
            selectTextOnFocus
          />
          <View style={styles.editActions}>
            <Pressable
              style={[styles.editButton, styles.saveButton]}
              onPress={() => onSave(editName)}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Pressable>
            <Pressable
              style={[styles.editButton, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              Cancel
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.portfolioCard}>
      <Pressable
        wrapInText={false}
        style={styles.portfolioHeader}
        onPress={toggleExpanded}
      >
        <View style={styles.portfolioInfo}>
          <Text style={styles.portfolioName}>{portfolio.name}</Text>
          <Text style={styles.portfolioSubtext}>
            {stockCount} {stockCount === 1 ? 'stock' : 'stocks'}
          </Text>
        </View>

        <View style={styles.portfolioActions}>
          <Pressable
            wrapInText={false}
            style={styles.editIconButton}
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Icon icon={PencilIcon} size={24} />
          </Pressable>

          <Pressable
            wrapInText={false}
            style={styles.editIconButton}
            onPress={(e) => {
              e.stopPropagation();
              onDelete(portfolio.id);
            }}
          >
            <Icon icon={DeleteIcon} size={24} />
          </Pressable>
        </View>
      </Pressable>

      <Animated.View style={heightStyle}>
        <View onLayout={handleContentLayout} style={styles.contentContainer}>
          {stocks.length > 0 ? (
            <View style={styles.stocksList}>
              {stocks.map((stock, index) => (
                <StockListItem
                  key={stock.id}
                  stock={stock}
                  onPress={() => onStockPress(stock)}
                  onDelete={() => onStockDelete(stock.id)}
                  isLast={index === stocks.length - 1}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyStocks}>
              <Text style={styles.emptyStocksText}>
                No stocks in this portfolio yet
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  portfolioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  portfolioAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00C805',
    marginRight: 12,
  },
  portfolioInfo: {
    flex: 1,
  },
  portfolioName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.interMedium,
    marginBottom: 2,
  },
  portfolioSubtext: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 14,
  },
  editIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 8,
  },
  editIcon: {
    fontSize: 16,
  },
  arrowContainer: {
    padding: 4,
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
  },
  editContainer: {
    padding: 20,
  },
  editInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#00C805',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.interMedium,
  },
  contentContainer: {
    position: 'absolute',
    width: '100%',
  },
  stocksList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  emptyStocks: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStocksText: {
    color: '#FFFFFF',
    opacity: 0.5,
    fontSize: 14,
    fontStyle: 'italic',
  },
  portfolioActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  deleteIcon: {
    fontSize: 16,
  },
});

export interface SoftOrderCondition {
  type: 'has_base' | 'has_bottom_topping' | 'has_top_topping';
  ingredientIds?: string[];
}

export interface SoftOrderData {
  id: string;
  hintText: string;
  condition: SoftOrderCondition;
  bonusCoins: number;
  hintIngredientIds: string[];
}

export const SOFT_ORDERS: SoftOrderData[] = [
  {
    id: 'green',
    hintText: '초록초록한 게 마시고 싶어~',
    condition: { type: 'has_base', ingredientIds: ['matcha'] },
    bonusCoins: 5,
    hintIngredientIds: ['matcha'],
  },
  {
    id: 'purple',
    hintText: '보라보라한 게 땡겨!',
    condition: { type: 'has_base', ingredientIds: ['taro'] },
    bonusCoins: 5,
    hintIngredientIds: ['taro'],
  },
  {
    id: 'round',
    hintText: '동글동글한 게 들어간 거!',
    condition: { type: 'has_bottom_topping' },
    bonusCoins: 5,
    hintIngredientIds: ['pearl', 'jelly'],
  },
  {
    id: 'sweet',
    hintText: '달콤한 거 올려주세요~',
    condition: { type: 'has_top_topping' },
    bonusCoins: 5,
    hintIngredientIds: ['cream', 'syrup'],
  },
];

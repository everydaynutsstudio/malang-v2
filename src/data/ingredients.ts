export interface Ingredient {
  id: string;
  name: string;
  nameKo: string;
  category: 'base' | 'topping';
  layer: 'bottom' | 'body' | 'top';
  color?: string;
  sprite?: string;
  tool: 'pitcher' | 'scoop' | 'drizzle';
}

export const INGREDIENTS: Ingredient[] = [
  // Base
  { id: 'milktea', name: 'Milk Tea', nameKo: '밀크티', category: 'base', layer: 'body', color: '#D4A574', tool: 'pitcher' },
  { id: 'taro',    name: 'Taro',     nameKo: '타로',   category: 'base', layer: 'body', color: '#B8A0D2', tool: 'pitcher' },
  { id: 'matcha',  name: 'Matcha',   nameKo: '말차',   category: 'base', layer: 'body', color: '#A8C686', tool: 'pitcher' },

  // Bottom Topping
  { id: 'pearl', name: 'Pearl',        nameKo: '펄',          category: 'topping', layer: 'bottom', color: '#1a1a1a',              sprite: 'pearl', tool: 'scoop' },
  { id: 'jelly', name: 'Jelly',        nameKo: '젤리',         category: 'topping', layer: 'bottom', color: 'rgba(180,240,200,0.75)', sprite: 'jelly', tool: 'scoop' },
  { id: 'oreo',  name: 'Oreo Crumble', nameKo: '오레오 크럼블', category: 'topping', layer: 'bottom', color: '#2a1a0a',              sprite: 'oreo',  tool: 'scoop' },

  // Top Topping
  { id: 'cream', name: 'Cream', nameKo: '크림',       category: 'topping', layer: 'top', color: '#ffffff', sprite: 'cream', tool: 'drizzle' },
  { id: 'syrup', name: 'Syrup', nameKo: '시럽 드리즐', category: 'topping', layer: 'top', color: '#8B4513', sprite: 'syrup', tool: 'drizzle' },
];

export const INGREDIENTS_MAP = Object.fromEntries(INGREDIENTS.map(i => [i.id, i]));

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  parentId?: string;
  visibleByDefault?: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'dealers', name: 'Dealers', color: '#10B981', icon: 'store' },
  { id: 'service', name: 'Service', color: '#3B82F6', icon: 'wrench' },
  { id: 'operators', name: 'Operators', color: '#8B5CF6', icon: 'user' },
  { id: 'manufacturer', name: 'Manufacturer', color: '#EF4444', icon: 'factory' },
  { id: 'institutions', name: 'Institutions', color: '#6366F1', icon: 'building' },
  { id: 'organization', name: 'Organization', color: '#EC4899', icon: 'users' },
  { id: 'professional', name: 'Professional', color: '#14B8A6', icon: 'briefcase' },
  { id: 'talent', name: 'Talent', color: '#F59E0B', icon: 'star' },
  { id: 'media', name: 'Media', color: '#84CC16', icon: 'tv' },
  { id: 'research', name: 'Research', color: '#06B6D4', icon: 'microscope' },
  { id: 'technology', name: 'Technology', color: '#64748B', icon: 'cpu' },
  { id: 'public', name: 'Public', color: '#D97706', icon: 'globe' },
  { id: 'activities', name: 'Activities', color: '#A855F7', icon: 'activity' },
  { id: 'participants', name: 'Participants', color: '#0EA5E9', icon: 'user-check' },
];

export const buildCategoryTree = (categories: Category[]): Category[] => {
  const byParent = new Map<string | undefined, Category[]>();
  for (const category of categories) {
    const parentId = categories.some((candidate) => candidate.id === category.parentId)
      ? category.parentId
      : undefined;
    const siblings = byParent.get(parentId) ?? [];
    siblings.push(category);
    byParent.set(parentId, siblings);
  }

  const result: Category[] = [];
  const visited = new Set<string>();
  const appendChildren = (parentId: string | undefined) => {
    const children = byParent.get(parentId) ?? [];
    children.sort((left, right) => left.name.localeCompare(right.name));
    for (const child of children) {
      if (visited.has(child.id)) continue;
      visited.add(child.id);
      result.push(child);
      appendChildren(child.id);
    }
  };

  appendChildren(undefined);
  for (const category of categories) {
    if (visited.has(category.id)) continue;
    visited.add(category.id);
    result.push(category);
    appendChildren(category.id);
  }
  return result;
};
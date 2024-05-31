export interface CategoryDto {
  id: string;
  name: string;
  description: string;
  slug: string;
  parent?: {
    id: string;
  };
  ancestors: { id: string; type: string }[];
}

export interface CategoryMagento {
  id: number;
  parent_id?: number;
  name: string;
  is_active: boolean;
  position: number;
  level: number;
  product_count: number;
  children_data: CategoryMagento[];
}

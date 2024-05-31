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

export interface CategoryCommercetool {
  limit: number;
  offset: number;
  count: number;
  total: number;
  results: CategoryResultCommercetool[];
}

export interface CategoryResultCommercetool {
  id: string;
  version: number;
  versionModifiedAt: string;
  lastMessageSequenceNumber: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: {
    clientId: string;
    isPlatformClient: boolean;
  };
  createdBy: {
    clientId: string;
    isPlatformClient: boolean;
  };
  key: string;
  name: {
    'en-US': string;
  };
  slug: {
    'en-US': string;
  };
  ancestors: {
    typeId: string;
    id: string;
  }[];
  parent?: {
    typeId: string;
    id: string;
  };
  orderHint: string;
  assets: [];
}

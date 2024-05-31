export interface ProductQuery {
  categoryId: string;
  offset: string;
  limit: string;
}

export interface ProductsDto {
  results: ProductDto[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  slug: string;
  variants: ProductVariantDto[];
  masterVariant: ProductVariantDto;
}

export interface ProductImageDto {
  url: string;
}

export interface ProductPriceDto {
  value: {
    currencyCode: string;
    centAmount: number;
  };
}

export interface ProductAttributeDto {
  name: string;
  value: {
    key: string;
    label: string;
  };
}

export interface ProductVariantDto {
  id: string;
  sku: string;
  images: ProductImageDto[];
  prices: ProductPriceDto[];
  attributes: ProductAttributeDto[];
}

export interface ProductMagento {
  total_count: number;
  search_criteria: {
    filter_groups: any[];
    page_size: number;
    current_page: number;
  };
  items: ProductMagentoItem[];
}

export interface ProductMagentoItem {
  attribute_set_id: number;
  created_at: string;
  id: number;
  name: string;
  sku: string;
  visibility: number;
  product_links: ProductLinksMagento[];
  price: number;
  media_gallery_entries: ProductMediaGalleryMagento[];
  custom_attributes: ProductMagentpCustomAttribute[];
  extension_attributes: ProductExtensionAttributesMagento;
}

export interface ProductMagentpCustomAttribute {
  attribute_code: string;
  value: string;
}

export interface ProductLinksMagento {
  sku: string;
  link_type: string;
  linked_product_sku: string;
  linked_product_type: string;
  position: number;
}

export interface ProductExtensionAttributesMagento {
  configurable_product_options: ConfigurableProductOptionsMagento[];
}

export interface ConfigurableProductOptionsMagento {
  id: number;
  attribute_id: string;
  label: string;
  position: number;
  values: { value_index: number }[];
}

export interface ProductMediaGalleryMagento {
  id: number;
  media_type: string;
  label: string;
  position: number;
  disabled: boolean;
  types: string[];
  file: string;
}

export const idToColor: Record<number, string> = {
  49: 'black',
  50: 'blue',
  51: 'brown',
  52: 'gray',
  53: 'green',
  54: 'lavender',
  55: 'multi',
  56: 'orange',
  57: 'purple',
  58: 'red',
  59: 'white',
  60: 'yellow',
};

export const idToSize: Record<number, string> = {
  166: 'XS',
  167: 'S',
  168: 'M',
  169: 'L',
  170: 'XL',
  171: '28',
  172: '29',
  173: '30',
  174: '31',
  175: '32',
  176: '33',
  177: '34',
  178: '36',
  179: '38',
  91: '55 cm',
  92: '65 cm',
  93: '75 cm',
  94: '6 foot',
  95: '8 foot',
  96: '10 foot',
};

import { HttpService } from '@nestjs/axios';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

interface ProductQuery {
  categoryId: string;
  offset: string;
  limit: string;
}

interface ProductsDto {
  results: ProductDto[];
  total: number;
  limit: number;
  offset: number;
}

interface ProductDto {
  id: string;
  name: string;
  description: string;
  slug: string;
  variants: ProductVariantDto[];
  masterVariant: ProductVariantDto;
}

interface ProductImageDto {
  url: string;
}

interface ProductPriceDto {
  value: {
    currencyCode: string;
    centAmount: number;
  };
}

interface ProductAttributeDto {
  name: string;
  value: {
    key: string;
    label: string;
  };
}

interface ProductVariantDto {
  id: string;
  sku: string;
  images: ProductImageDto[];
  prices: ProductPriceDto[];
  attributes: ProductAttributeDto[];
}

interface ProductMagento {
  total_count: number;
  search_criteria: {
    filter_groups: any[];
    page_size: number;
    current_page: number;
  };
  items: ProductMagentoItem[];
}

interface ProductMagentoItem {
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

interface ProductMagentpCustomAttribute {
  attribute_code: string;
  value: string;
}

interface ProductLinksMagento {
  sku: string;
  link_type: string;
  linked_product_sku: string;
  linked_product_type: string;
  position: number;
}

interface ProductExtensionAttributesMagento {
  configurable_product_options: ConfigurableProductOptionsMagento[];
}

interface ConfigurableProductOptionsMagento {
  id: number;
  attribute_id: string;
  label: string;
  position: number;
  values: { value_index: number }[];
}

interface ProductMediaGalleryMagento {
  id: number;
  media_type: string;
  label: string;
  position: number;
  disabled: boolean;
  types: string[];
  file: string;
}

const idToColor: Record<number, string> = {
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

const idToSize: Record<number, string> = {
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

@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly http: HttpService) {}

  @Get()
  getAll(@Query() query: ProductQuery): Observable<ProductsDto> {
    return this.http
      .get<ProductMagento>('https://magento.test/rest/V1/products', {
        params: {
          ['searchCriteria[pageSize]']: query.limit,
          ['searchCriteria[currentPage]']: query.offset,
          ['searchCriteria[filterGroups][0][filters][0][field]']: 'category_id',
          ['searchCriteria[filterGroups][0][filters][0][value]']:
            query.categoryId,
          ['searchCriteria[filterGroups][0][filters][1][value]']: 4,
          ['searchCriteria[filterGroups][0][filters][1][condition_type]']: 'eq',
          ['searchCriteria[filterGroups][0][filters][1][field]']: 'visibility',
        },
      })
      .pipe(
        map((response) => {
          return {
            offset: response.data.search_criteria.current_page,
            limit: response.data.search_criteria.page_size,
            total: response.data.total_count,
            results: response.data.items.map((pr) => this.mapProduct(pr)),
          };
        }),
      );
  }

  @Get(':id')
  getOne(@Param() params: any): Observable<ProductDto> {
    return this.http
      .get<ProductMagentoItem>(
        `https://magento.test/rest/V1/products/${params.id}`,
      )
      .pipe(map((response) => this.mapProduct(response.data)));
  }

  private mapProduct(product: ProductMagentoItem): ProductDto {
    const variants = this.mapVariant(product);

    return {
      id: product.id.toString(),
      name: product.name,
      description: product.custom_attributes.find(
        (e) => e.attribute_code === 'description',
      )?.value,
      slug: product.name,
      variants,
      masterVariant: variants[0],
    };
  }

  private mapVariant(variant: ProductMagentoItem): ProductVariantDto[] {
    return variant.media_gallery_entries.map(() => {
      return {
        id: variant.id.toString(),
        sku: variant.sku,
        images: variant.media_gallery_entries.map(this.mapImage),
        prices: [
          {
            value: {
              currencyCode: 'USD',
              centAmount: variant.price * 100,
            },
          },
        ],
        attributes:
          variant.extension_attributes.configurable_product_options.flatMap(
            (attr) => {
              return attr.values.map((v) => {
                return {
                  name: attr.label,
                  value: {
                    key: v.value_index.toString(),
                    label: this.mapAttributeLabel(attr.label, v.value_index),
                  },
                };
              });
            },
          ),
      };
    });
  }

  private mapAttributeLabel(label: string, value: number) {
    if (label === 'Color') {
      return idToColor[value];
    }

    if (label === 'Size') {
      return idToSize[value];
    }

    return value.toString();
  }

  private mapImage(image: ProductMediaGalleryMagento): ProductImageDto {
    return {
      url: `https://magento.test/pub/media/catalog/product${image.file}`,
    };
  }
}

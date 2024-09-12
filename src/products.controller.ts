import { HttpService } from '@nestjs/axios';
import { Controller, Get, Query } from '@nestjs/common';
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
  visibility: number;
  product_links: ProductLinksMagento[];
  price: number;
  media_gallery_entries: ProductMediaGalleryMagento[];
  custom_attributes: ProductMagentpCustomAttribute[];
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
  extension_attributes: any;
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

  private mapProduct(product: ProductMagentoItem): ProductDto {
    const variants = this.mapVariant(product);

    return {
      id: product.id.toString(),
      name: product.name,
      description: product.name,
      slug: product.name,
      variants,
      masterVariant: variants[0],
    };
  }

  private mapVariant(variant: ProductMagentoItem): ProductVariantDto[] {
    return (
      variant.product_links.length ? variant.product_links : [variant]
    ).map((link) => {
      return {
        id: link.linked_product_sku,
        sku: link.linked_product_sku,
        images: variant.media_gallery_entries.map(this.mapImage),
        prices: [
          {
            value: {
              currencyCode: 'USD',
              centAmount: variant.price * 100,
            },
          },
        ],
        attributes: variant.custom_attributes.map((attr) => {
          return {
            name: attr.attribute_code,
            value: {
              key: attr.attribute_code,
              label: attr.value,
            },
          };
        }),
      };
    });
  }

  private mapImage(image: ProductMediaGalleryMagento): ProductImageDto {
    return {
      url: `https://magento.test/pub/media/catalog/product${image.file}`,
    };
  }
}

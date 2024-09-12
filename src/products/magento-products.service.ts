import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import {
  ProductDto,
  ProductImageDto,
  ProductMagento,
  ProductMagentoItem,
  ProductMediaGalleryMagento,
  ProductQuery,
  ProductVariantDto,
  ProductsDto,
  idToColor,
  idToSize,
} from './products.models';

@Injectable()
export class MagentoProductsService {
  constructor(private readonly http: HttpService) {}

  getAll(query: ProductQuery): Observable<ProductsDto> {
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

  getOne(params: any): Observable<ProductDto> {
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
          variant.extension_attributes.configurable_product_options?.flatMap(
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

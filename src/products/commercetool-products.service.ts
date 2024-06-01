import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import {
  ProductQuery,
  ProductsDto,
  ProductCommercetool,
  ProductDto,
  ProductResultCommercetool,
} from './products.models';
import { ConfigService } from '../config.service';

@Injectable()
export class CommercetoolProductsService {
  constructor(
    private readonly http: HttpService,
    private config: ConfigService,
  ) {}

  getAll(query: ProductQuery): Observable<any> {
    return this.http
      .get<ProductCommercetool>(
        `${this.config.COMMERCE_TOOLS_URL}/product-projections/search`,
        {
          headers: {
            Authorization: `Bearer ${this.config.COMMERCE_AUTH_TOKEN}`,
          },
          params: {
            filter: `categories.id:"${query.categoryId}"`,
            limit: query.limit,
            offset: query.offset,
          },
        },
      )
      .pipe(map((response) => this.mapProducts(response.data)));
  }

  private mapProducts(products: ProductCommercetool): ProductsDto {
    return {
      offset: products.offset,
      limit: products.count,
      total: products.total,
      results: products.results.map((pr) => this.mapProduct(pr)),
    };
  }

  private mapProduct(product: ProductResultCommercetool): ProductDto {
    return {
      id: product.id,
      name: product.name['en-US'],
      description: product.description['en-US'],
      slug: product.slug['en-US'],
      masterVariant: {
        id: product.masterVariant.id,
        sku: product.id,
        prices: product.masterVariant.prices,
        images: product.masterVariant.images.map((img) => {
          return {
            url: img.url,
          };
        }),
        attributes: product.masterVariant.attributes.map((attr) => ({
          name: attr.name,
          value: {
            key: attr.value,
            label: attr.name,
          },
        })),
      },
      variants: product.variants.map((variant) => ({
        id: variant.id,
        prices: variant.prices,
        sku: variant.sku,
        images: variant.images.map((img) => {
          return {
            url: img.url,
          };
        }),
        attributes: product.masterVariant.attributes.map((attr) => ({
          name: attr.name,
          value: {
            key: attr.value,
            label: attr.name,
          },
        })),
      })),
    };
  }

  getOne(params: any): Observable<ProductDto> {
    return this.http
      .get<ProductCommercetool>(
        `${this.config.COMMERCE_TOOLS_URL}/product-projections/search`,
        {
          headers: {
            Authorization: `Bearer ${this.config.COMMERCE_AUTH_TOKEN}`,
          },
          params: {
            filter: `id:"${params.id}"`,
          },
        },
      )
      .pipe(
        map((response) => {
          return this.mapProduct(response.data.results[0]);
        }),
      );
  }
}

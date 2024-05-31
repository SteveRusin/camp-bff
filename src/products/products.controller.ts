import { HttpService } from '@nestjs/axios';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import { MagentoProductsService } from './magento-products.service';
import { ProductDto, ProductQuery, ProductsDto } from './products.models';

@Controller('products')
export class ProductsController {
  constructor(private magentoProducts: MagentoProductsService) {}

  @Get()
  getAll(@Query() query: ProductQuery): Observable<ProductsDto> {
    return this.magentoProducts.getAll(query);
  }

  @Get(':id')
  getOne(@Param() params: any): Observable<ProductDto> {
    return this.magentoProducts.getOne(params);
  }
}

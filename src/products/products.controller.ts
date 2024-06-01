import { HttpService } from '@nestjs/axios';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { Observable } from 'rxjs';

import { MagentoProductsService } from './magento-products.service';
import { ProductDto, ProductQuery, ProductsDto } from './products.models';
import { CommercetoolProductsService } from './commercetool-products.service';
import { ConfigService } from '../config.service';

@Controller('products')
export class ProductsController {
  constructor(
    private magentoProducts: MagentoProductsService,
    private commercetoolProducts: CommercetoolProductsService,
    private config: ConfigService,
  ) {}

  @Get()
  getAll(@Query() query: ProductQuery): Observable<ProductsDto> {
    return this.config.USE_COMMERCE_TOOLS
      ? this.commercetoolProducts.getAll(query)
      : this.magentoProducts.getAll(query);
  }

  @Get(':id')
  getOne(@Param() params: any): Observable<ProductDto> {
    return this.config.USE_COMMERCE_TOOLS
      ? this.commercetoolProducts.getOne(params)
      : this.magentoProducts.getOne(params);
  }
}

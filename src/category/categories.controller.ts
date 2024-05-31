import { Controller, Get, Query } from '@nestjs/common';
import { Observable } from 'rxjs';

import { MagentoCategoriesService } from './magento-categories.service';
import { CategoryDto } from './category.models';
import { ConfigService } from '../config.service';
import { CommercetoolCategoriesService } from './commercetool-categories.service';

@Controller('categories')
export class CategoryController {
  constructor(
    private config: ConfigService,
    private magentoCategory: MagentoCategoriesService,
    private commercetoolCategory: CommercetoolCategoriesService,
  ) {}

  @Get()
  getAll(): Observable<CategoryDto[]> {
    return this.config.USE_COMMERCE_TOOLS
      ? this.commercetoolCategory.getAll()
      : this.magentoCategory.getAll();
  }
}

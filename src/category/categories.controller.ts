import { Controller, Get, Query } from '@nestjs/common';
import { Observable } from 'rxjs';

import { MagentoCategoriesService } from './magento-categories.service';
import { CategoryDto } from './category.models';

@Controller('categories')
export class CategoryController {
  constructor(private magentoCategory: MagentoCategoriesService) {}

  @Get()
  getAll(): Observable<CategoryDto[]> {
    return this.magentoCategory.getAll();
  }
}

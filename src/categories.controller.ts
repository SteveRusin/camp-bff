import { HttpService } from '@nestjs/axios';
import { Controller, Get, Query } from '@nestjs/common';
import { Agent } from 'https';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

interface CategoryDto {
  id: string;
  name: string;
  description: string;
  slug: string;
  parent?: {
    id: string;
  };
  ancestors: { id: string; type: string }[];
}

interface CategoryMagento {
  id: number;
  parent_id?: number;
  name: string;
  is_active: boolean;
  position: number;
  level: number;
  product_count: number;
  children_data: CategoryMagento[];
}

@Controller('api/v1/categories')
export class CategoryController {
  constructor(private readonly http: HttpService) {}
  @Get()
  getAll(@Query() query: any): Observable<CategoryDto[]> {
    return this.http
      .get<CategoryMagento>('https://magento.test/rest/V1/categories')
      .pipe(map((response) => this.mapCategory(response.data)));
  }

  private mapCategory(category: CategoryMagento): CategoryDto[] {
    const categories: CategoryDto[] = category.children_data.map((cat) => {
      return {
        id: cat.id.toString(),
        name: cat.name,
        description: cat.name,
        slug: cat.id.toString(),
        parent: {
          id: cat.parent_id?.toString(),
        },
        ancestors: this.mapAncestors(cat),
      };
    });

    categories.unshift({
      id: category.id.toString(),
      name: category.name,
      description: category.name,
      slug: category.id.toString(),
      ancestors: [],
    });

    return categories;
  }

  private mapAncestors(
    category: CategoryMagento,
  ): { id: string; type: string }[] {
    const ancestors = [];
    let parent = category;
    while (parent?.parent_id) {
      ancestors.push({
        id: parent.parent_id.toString(),
        type: 'category',
      });
      parent = parent.children_data[0];
    }
    return ancestors;
  }
}

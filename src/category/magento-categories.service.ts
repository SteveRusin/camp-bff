import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CategoryDto, CategoryMagento } from './category.models';

import { map } from 'rxjs/operators';

@Injectable()
export class MagentoCategoriesService {
  constructor(private readonly http: HttpService) {}
  getAll(): Observable<CategoryDto[]> {
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

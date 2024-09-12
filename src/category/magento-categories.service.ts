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
      .pipe(map((response) => this.mapCategories(response.data)));
  }

  private mapCategories(categories: CategoryMagento) {
    const result = [
      {
        id: categories.id.toString(),
        name: categories.name,
        description: categories.name,
        slug: categories.id.toString(),
        ancestors: [],
      },
    ];

    this.mapCategory(categories, categories, result);

    result.forEach((cat) => {
      cat.ancestors.sort((a, b) => {
        return +a.id - +b.id;
      });
    });

    return result;
  }

  private mapCategory(
    root: CategoryMagento,
    category: CategoryMagento,
    agg: CategoryDto[],
  ): CategoryDto[] {
    category.children_data.forEach((cat) => {
      agg.push({
        id: cat.id.toString(),
        name: cat.name,
        description: cat.name,
        slug: cat.id.toString(),
        parent: {
          id: cat.parent_id?.toString(),
        },
        ancestors: this.mapAncestors(root, cat),
      });

      if (cat.children_data) {
        this.mapCategory(root, cat, agg);
      }
    });

    return agg;
  }

  private mapAncestors(
    root: CategoryMagento,
    category: CategoryMagento,
  ): { id: string; type: string }[] {
    const ancestors = [];
    let parent = null;
    do {
      parent = this.findParent(root, category.parent_id);
      parent &&
        ancestors.push({
          id: parent.id?.toString(),
          type: 'category',
        });
      category = parent;
    } while (category?.parent_id);

    return ancestors;
  }

  private findParent(
    category: CategoryMagento,
    id: number,
  ): CategoryMagento | void {
    if (category.id === id) {
      return category;
    }

    if (!category.children_data) {
      return null;
    }

    for (const cat of category.children_data) {
      const res = this.findParent(cat, id);

      if (res) {
        return res;
      }
    }

    return null;
  }
}

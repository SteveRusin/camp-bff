import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  CategoryDto,
  CategoryCommercetool,
  CategoryResultCommercetool,
} from './category.models';

import { map } from 'rxjs/operators';
import { ConfigService } from '../config.service';

@Injectable()
export class CommercetoolCategoriesService {
  constructor(
    private readonly http: HttpService,
    private config: ConfigService,
  ) {}
  getAll(): Observable<CategoryDto[]> {
    return this.http
      .get<CategoryCommercetool>(
        `${this.config.COMMERCE_TOOLS_URL}/categories`,
        {
          headers: {
            Authorization: `Bearer ${this.config.COMMERCE_AUTH_TOKEN}`,
          },
        },
      )
      .pipe(map((response) => this.mapCategory(response.data)));
  }

  private mapCategory(category: CategoryCommercetool): CategoryDto[] {
    const categories: CategoryDto[] = category.results.map((cat) => {
      return {
        id: cat.id,
        name: cat.name['en-US'],
        description: cat.name['en-US'],
        slug: cat.slug['en-US'],
        parent: cat.parent?.id && {
          id: cat.parent?.id,
        },
        ancestors: this.mapAncestors(category.results, cat),
      };
    });

    return categories;
  }

  private mapAncestors(
    cat: CategoryResultCommercetool[],
    currCategory: CategoryResultCommercetool,
  ): { id: string; type: string }[] {
    const ancestors = [];
    let parent = currCategory;
    while (parent?.parent) {
      const parentCategory = cat.find((c) => c.id === parent.parent.id);
      ancestors.push({
        id: parentCategory.id,
        type: 'category',
      });
      parent = parentCategory;
    }
    return ancestors;
  }
}

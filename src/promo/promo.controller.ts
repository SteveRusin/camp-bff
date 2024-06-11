import { Controller, Get, Param } from '@nestjs/common';
import { ConfigService } from '../config.service';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

interface PromoDto {
  sku: string;
  promos: {
    text: string;
    order: number;
  }[];
}

interface Promo {
  promo_text: {
    title: string;
    promo_description: string;
  };
}

interface ContentStackEntity {
  uid: string;
  commercetools_id: string;
  promo_section: Promo[];
  title: string;
  url: string;
}

@Controller('promos')
export class PromoController {
  constructor(
    private config: ConfigService,
    private http: HttpService,
  ) {}

  @Get(':sku')
  getPromos(@Param('sku') sku: string): Observable<PromoDto> {
    return this.http
      .get<{
        entries: ContentStackEntity[];
      }>(
        `${this.config.CONTENT_STACK_BASE_URL}/v3/content_types/product/entries`,
        {
          headers: {
            api_key: this.config.CONTENT_STACK_API_KEY,
            access_token: this.config.CONTENT_STACK_DELIVERY_TOKEN,
          },
          params: {
            environment: 'development',
            query: `{"commercetools_id": "${sku}"}`,
          },
        },
      )
      .pipe(
        map((resp) => {
          const entity = resp.data.entries?.[0];
          if (!entity) {
            throw new Error('Something went wrong');
          }

          return this.mapEntity(entity);
        }),
      );
  }

  private mapEntity(e: ContentStackEntity): PromoDto {
    return {
      sku: e.commercetools_id,
      promos: e.promo_section.map((promo, i) => {
        return {
          order: i,
          text: `
            <div class="p-4 my-2 flex h-[300px] shadow bg-lime-100 rounded-xl">
               <div class="flex-grow">
                     <h2 class="text-2xl font-serif">${promo.promo_text.title}</h2>
                     <p>${promo.promo_text.promo_description}</p>
               </div>
            </div>`,
        };
      }),
    };
  }
}

import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';

import { map, catchError } from 'rxjs/operators';

type CartAction = 'AddLineItem' | 'RemoveLineItem' | 'ChangeLineItemQuantity';

interface AddLineItem {
  quantity: number;
  variantId: string;
}

interface ChangeLineItemQuantity {
  quantity: number;
  lineItemId: string;
}

interface RemoveLineItem {
  lineItemId: string;
  quantity: number;
}

interface PutCartDto {
  version: number;
  action: CartAction;
  AddLineItem?: AddLineItem;
  ChangeLineItemQuantity?: ChangeLineItemQuantity;
  RemoveLineItem?: RemoveLineItem;
}

interface MagentoCartItem {
  qty: number;
  quote_id: string;
  sku: string;
  price?: number;
  name?: string;
  extension_attributes?: {
    image_url: string;
  };
}

interface LineItem {
  id?: string;
  variant?: ProductVariant;
  quantity?: number;
  totalPrice?: number;
  currencyCode?: string;
}

interface GetCartDto {
  id: string;
  customerId: string;
  lineItems: LineItem[];
  totalPrice: {
    currencyCode: string;
    centAmount: number;
  };
  totalQuantity: number;
}

interface MagentoCart {
  id: string;
  customer: {
    id: number;
  };
  items_qty: number;
  items: MagentoCartItem[];
}

export interface ProductVariant {
  id?: string;
  sku?: string;
  name?: string;
  slug?: string;
  images?: { url: string }[];
  prices?: { value: { currencyCode: string; centAmount: number } }[];
}

@Controller('api/v1/carts')
export class CheckoutCartController {
  constructor(private readonly http: HttpService) {}

  @Post()
  createCart() {
    return this.http
      .post(`https://magento.test/rest/V1/guest-carts`)
      .pipe(map((cartId) => ({ id: cartId.data })));
  }

  @Get(':id')
  getCart(@Param('id') id: string): Observable<GetCartDto> {
    const cart$ = this.http
      .get<MagentoCart>(`https://magento.test/rest/V1/guest-carts/${id}`)
      .pipe(
        map((response) => {
          return {
            id,
            customerId: response.data.customer?.id?.toString(),
            lineItems: response.data.items.map((item): LineItem => {
              const image = item.extension_attributes?.image_url;
              return {
                id: item.sku,
                quantity: item.qty,
                totalPrice: item.price * item.qty,
                currencyCode: 'USD',
                variant: {
                  id: item.sku,
                  sku: item.sku,
                  name: item.name,
                  slug: item.name,
                  prices: [
                    {
                      value: {
                        currencyCode: 'USD',
                        centAmount: item.price * 100,
                      },
                    },
                  ],
                  images: [
                    {
                      url: image || 'https://via.placeholder.com/150',
                    },
                  ],
                },
              };
            }),
            totalPrice: {
              currencyCode: 'USD',
              centAmount:
                response.data.items.reduce(
                  (acc, item) => acc + item.price * item.qty,
                  0,
                ) * 100,
            },
            totalQuantity: response.data.items_qty,
          };
        }),
      );

    return cart$;
  }

  @Put(':id')
  updateCart(@Param('id') id: string, @Body() body: PutCartDto) {
    if (body.action === 'AddLineItem') {
      return this.addLineItem(body, id);
    }

    if (body.action === 'ChangeLineItemQuantity') {
      // todo
      return this.changeLineItemQuantity(body, id);
    }

    if (body.action === 'RemoveLineItem') {
      // todo
      return this.removeLineItem(body, id);
    }

    return throwError(() => 'Invalid action');
  }

  private changeLineItemQuantity(body: PutCartDto, id: string) {
    const itemId = body.ChangeLineItemQuantity.lineItemId;
    const cartItem: MagentoCartItem = {
      qty: body.ChangeLineItemQuantity.quantity,
      quote_id: id,
      sku: itemId,
    };

    return this.http
      .put(`https://magento.test/rest/V1/guest-carts/${id}/items/${itemId}`, {
        cartItem,
      })
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  private removeLineItem(body: PutCartDto, id: string) {
    return this.http
      .delete(
        `https://magento.test/rest/V1/guest-carts/${id}/items/${body.RemoveLineItem.lineItemId}`,
      )
      .pipe(map((response) => response.data));
  }

  private addLineItem(body: PutCartDto, id: string) {
    const cartItem: MagentoCartItem = {
      qty: body.AddLineItem.quantity,
      quote_id: body.AddLineItem.variantId,
      sku: body.AddLineItem.variantId,
    };

    return this.http
      .post(`https://magento.test/rest/V1/guest-carts/${id}/items`, {
        cartItem,
      })
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }
}

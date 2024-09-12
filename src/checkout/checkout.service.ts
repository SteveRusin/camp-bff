import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

import { map } from 'rxjs/operators';
import {
  GetCartDto,
  LineItem,
  MagentoCart,
  MagentoCartItem,
  MagentoShippingAddress,
  PutCartDto,
} from './checkout.models';

@Injectable()
export class MagentoCheckoutCartService {
  constructor(private readonly http: HttpService) {}

  createCart() {
    return this.http
      .post(`https://magento.test/rest/V1/guest-carts`)
      .pipe(map((cartId) => ({ id: cartId.data })));
  }

  createOrder(id: string) {
    return this.http
      .put(`https://magento.test/rest/V1/guest-carts/${id}/order`)
      .pipe(map((response) => response.data));
  }

  getCart(id: string): Observable<GetCartDto> {
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

  updateCart(id: string, body: PutCartDto) {
    if (body.action === 'AddLineItem') {
      return this.addLineItem(body, id);
    }

    if (body.action === 'ChangeLineItemQuantity') {
      return this.changeLineItemQuantity(body, id);
    }

    if (body.action === 'RemoveLineItem') {
      return this.removeLineItem(body, id);
    }

    if (body.action === 'SetShippingAddress') {
      return this.setShippingAddress(body, id);
    }

    return throwError(() => 'Invalid action');
  }

  private setShippingAddress(body: PutCartDto, id: string) {
    const address: MagentoShippingAddress = {
      addressInformation: {
        shipping_method_code: 'flatrate',
        shipping_carrier_code: 'flatrate',
        shipping_address: {
          city: body.SetShippingAddress.city,
          country_id: body.SetShippingAddress.country,
          email: body.SetShippingAddress.email,
          firstname: body.SetShippingAddress.firstName,
          lastname: body.SetShippingAddress.lastName,
          postcode: body.SetShippingAddress.postalCode,
          region: body.SetShippingAddress.region,
          street: [
            `${body.SetShippingAddress.streetName} ${body.SetShippingAddress.streetNumber}`,
          ],
          telephone: '1234567890',
        },
      },
    };

    return this.http
      .post(
        `https://magento.test/rest/V1/guest-carts/${id}/shipping-information`,
        address,
      )
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
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

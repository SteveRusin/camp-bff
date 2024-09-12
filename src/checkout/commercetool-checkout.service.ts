import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

import { map, switchMap } from 'rxjs/operators';
import {
  CommercetoolCart,
  CommercetoolCartAddItem,
  CommercetoolCartChangeQuantity,
  CommercetoolCartRemoveItem,
  CommercetoolCartSetShippingAddress,
  GetCartDto,
  PutCartDto,
} from './checkout.models';
import { ConfigService } from '../config.service';

@Injectable()
export class CommercetoolCheckoutCartService {
  constructor(
    private readonly http: HttpService,
    private config: ConfigService,
  ) {}

  createCart() {
    return this.http
      .post(
        `${this.config.COMMERCE_TOOLS_URL}/carts`,
        {
          currency: 'USD',
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.COMMERCE_AUTH_TOKEN}`,
          },
        },
      )
      .pipe(map((cartId) => ({ id: cartId.data.id })));
  }

  createOrder(id: string) {
    const cart$ = this.getCart(id);

    return cart$.pipe(
      switchMap((cart) => {
        return this.http
          .post(
            `${this.config.COMMERCE_TOOLS_URL}/orders`,
            {
              version: cart.version,
              cart: {
                id,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${this.config.COMMERCE_AUTH_TOKEN}`,
              },
            },
          )
          .pipe(map((response) => response.data));
      }),
    );
  }

  getCart(id: string): Observable<GetCartDto> {
    return this.http
      .get<CommercetoolCart>(`${this.config.COMMERCE_TOOLS_URL}/carts/${id}`, {
        headers: {
          Authorization: `Bearer ${this.config.COMMERCE_AUTH_TOKEN}`,
        },
      })
      .pipe(
        map((resp): GetCartDto => {
          return {
            ...resp.data,
            customerId: null,
            totalQuantity: resp.data.lineItems.length,
          };
        }),
      );
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
    const {
      city,
      email,
      region,
      country,
      lastName,
      firstName,
      postalCode,
      streetName,
      streetNumber,
    } = body.SetShippingAddress;
    const address: CommercetoolCartSetShippingAddress = {
      version: body.version - 1,
      actions: [
        {
          action: 'setShippingAddress',
          address: {
            city,
            email,
            region,
            country,
            lastName,
            firstName,
            postalCode,
            streetNumber,
            streetName,
          },
        },
      ],
    };

    return this.http
      .post(`${this.config.COMMERCE_TOOLS_URL}/carts/${id}`, address, {
        headers: {
          Authorization: `Bearer ${this.config.COMMERCE_AUTH_TOKEN}`,
        },
      })
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  private changeLineItemQuantity(body: PutCartDto, id: string) {
    const itemId = body.ChangeLineItemQuantity.lineItemId;
    const cartItem: CommercetoolCartChangeQuantity = {
      version: 1,
      actions: [
        {
          action: 'changeLineItemQuantity',
          lineItemId: itemId,
          quantity: body.ChangeLineItemQuantity.quantity,
        },
      ],
    };

    return this.http
      .post(`${this.config.COMMERCE_TOOLS_URL}/carts/${id}`, cartItem, {
        headers: {
          Authorization: `Bearer ${this.config.COMMERCE_AUTH_TOKEN}`,
        },
      })
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  private removeLineItem(body: PutCartDto, id: string) {
    const cartItem: CommercetoolCartRemoveItem = {
      version: 1,
      actions: [
        {
          lineItemId: body.RemoveLineItem.lineItemId,
          action: 'removeLineItem',
        },
      ],
    };

    return this.http
      .post(`${this.config.COMMERCE_TOOLS_URL}/carts/${id}`, cartItem, {
        headers: {
          Authorization: `Bearer ${this.config.COMMERCE_AUTH_TOKEN}`,
        },
      })
      .pipe(map((response) => response.data));
  }

  private addLineItem(body: PutCartDto, id: string) {
    const cartItem: CommercetoolCartAddItem = {
      version: 1,
      actions: [
        {
          action: 'addLineItem',
          productId: body.AddLineItem.variantId,
          variantId: 1,
          quantity: body.AddLineItem.quantity,
        },
      ],
    };

    return this.http
      .post(`${this.config.COMMERCE_TOOLS_URL}/carts/${id}`, cartItem, {
        headers: {
          Authorization: `Bearer ${this.config.COMMERCE_AUTH_TOKEN}`,
        },
      })
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }
}

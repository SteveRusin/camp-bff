import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Observable } from 'rxjs';

import { MagentoCheckoutCartService } from './checkout.service';
import { GetCartDto, PutCartDto } from './checkout.models';
import { CommercetoolCheckoutCartService } from './commercetool-checkout.service';
import { ConfigService } from '../config.service';

@Controller('carts')
export class CheckoutCartController {
  constructor(
    private magentoCartService: MagentoCheckoutCartService,
    private commercetoolCheckoutService: CommercetoolCheckoutCartService,
    private config: ConfigService,
  ) {}

  @Post()
  createCart() {
    return this.config.COMMERCE_TOOLS_URL
      ? this.commercetoolCheckoutService.createCart()
      : this.magentoCartService.createCart();
  }

  @Post(':id/order')
  createOrder(@Param('id') id: string) {
    return this.config.COMMERCE_TOOLS_URL
      ? this.commercetoolCheckoutService.createOrder(id)
      : this.magentoCartService.createOrder(id);
  }

  @Get(':id')
  getCart(@Param('id') id: string): Observable<GetCartDto> {
    return this.config.COMMERCE_TOOLS_URL
      ? this.commercetoolCheckoutService.getCart(id)
      : this.magentoCartService.getCart(id);
  }

  @Put(':id')
  updateCart(@Param('id') id: string, @Body() body: PutCartDto) {
    return this.config.USE_COMMERCE_TOOLS
      ? this.commercetoolCheckoutService.updateCart(id, body)
      : this.magentoCartService.updateCart(id, body);
  }
}

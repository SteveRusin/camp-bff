import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Observable } from 'rxjs';

import { MagentoCheckoutCartService } from './checkout.service';
import { GetCartDto, PutCartDto } from './checkout.models';

@Controller('carts')
export class CheckoutCartController {
  constructor(private magentoCartService: MagentoCheckoutCartService) {}

  @Post()
  createCart() {
    return this.magentoCartService.createCart();
  }

  @Post(':id/order')
  createOrder(@Param('id') id: string) {
    return this.magentoCartService.createOrder(id);
  }

  @Get(':id')
  getCart(@Param('id') id: string): Observable<GetCartDto> {
    return this.magentoCartService.getCart(id);
  }

  @Put(':id')
  updateCart(@Param('id') id: string, @Body() body: PutCartDto) {
    return this.magentoCartService.updateCart(id, body);
  }
}

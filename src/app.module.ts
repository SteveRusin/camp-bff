import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CategoryController } from './categories.controller';
import { ProductsController } from './products.controller';
import { CheckoutCartController } from './checkout-cart.controller';

@Module({
  imports: [HttpModule],
  controllers: [CategoryController, ProductsController, CheckoutCartController],
  providers: [],
})
export class AppModule {}

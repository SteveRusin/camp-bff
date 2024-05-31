import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CategoryController } from './category/categories.controller';
import { MagentoCategoriesService } from './category/magento-categories.service';
import { CommercetoolCategoriesService } from './category/commercetool-categories.service';
import { ProductsController } from './products/products.controller';
import { MagentoProductsService } from './products/magento-products.service';
import { CheckoutCartController } from './checkout/checkout-cart.controller';
import { MagentoCheckoutCartService } from './checkout/checkout.service';
import { ConfigService } from './config.service';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [CategoryController, ProductsController, CheckoutCartController],
  providers: [
    ConfigService,
    MagentoCategoriesService,
    MagentoProductsService,
    MagentoCheckoutCartService,
    CommercetoolCategoriesService,
  ],
})
export class AppModule implements NestModule {
  constructor(private config: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {}
}

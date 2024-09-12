import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CategoryController } from './category/categories.controller';
import { MagentoCategoriesService } from './category/magento-categories.service';
import { CommercetoolCategoriesService } from './category/commercetool-categories.service';
import { ProductsController } from './products/products.controller';
import { CommercetoolProductsService } from './products/commercetool-products.service';
import { MagentoProductsService } from './products/magento-products.service';
import { CheckoutCartController } from './checkout/checkout-cart.controller';
import { MagentoCheckoutCartService } from './checkout/checkout.service';
import { CommercetoolCheckoutCartService } from './checkout/commercetool-checkout.service';
import { ConfigService } from './config.service';
import { PromoController } from './promo/promo.controller';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [
    CategoryController,
    ProductsController,
    CheckoutCartController,
    PromoController,
  ],
  providers: [
    ConfigService,
    MagentoCategoriesService,
    MagentoProductsService,
    MagentoCheckoutCartService,
    CommercetoolCategoriesService,
    CommercetoolProductsService,
    CommercetoolCheckoutCartService,
  ],
})
export class AppModule implements NestModule {
  constructor(private config: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {}
}

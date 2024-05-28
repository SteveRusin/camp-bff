import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CategoryController } from './categories.controller';
import { ProductsController } from './products.controller';

@Module({
  imports: [HttpModule],
  controllers: [CategoryController, ProductsController],
  providers: [],
})
export class AppModule {}

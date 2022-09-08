import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Inject,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Order } from './entities/order.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Producer } from 'kafkajs';
import { KafkaMessagePaymentSuccess } from './dto/payment-success.dto';

@ApiBearerAuth()
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject('KAFKA_PRODUCER')
    private KafkaProducer: Producer,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create amount' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body()
    createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: Order,
  })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @MessagePattern('topico-exemplo')
  consumer(@Payload(new ValidationPipe()) message: KafkaMessagePaymentSuccess) {
    console.log(message.value);
  }

  @Post('producer')
  async producer(@Body() body) {
    await this.KafkaProducer.send({
      topic: 'topico-exemplo',
      messages: [{ key: 'pagamentos', value: JSON.stringify(body) }],
    });
    return 'Mensagem publicada';
  }
}

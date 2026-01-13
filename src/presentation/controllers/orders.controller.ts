import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateOrderWithTransactionUseCase } from '../../application/use-cases/orders/create-order-with-transaction.use-case';
import { GetAllOrdersUseCase } from '../../application/use-cases/orders/get-all-orders.use-case';
import { GetOrderByIdUseCase } from '../../application/use-cases/orders/get-order-by-id.use-case';
import { CancelOrderUseCase } from '../../application/use-cases/orders/cancel-order.use-case';
import { CreateOrderDto } from '../dto/create-order.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderWithTransactionUseCase,
    private readonly getAllOrdersUseCase: GetAllOrdersUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(AuditInterceptor)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or insufficient stock',
  })
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const createdBy = req.audit?.user;
    return await this.createOrderUseCase.execute(createOrderDto, createdBy);
  }

  @Get()
  @ApiOperation({ summary: 'List all orders with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of orders' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.getAllOrdersUseCase.execute({
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.getOrderByIdUseCase.execute(id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuditInterceptor)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  async cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const updatedBy = req.audit?.user;
    return await this.cancelOrderUseCase.execute(id, updatedBy);
  }
}

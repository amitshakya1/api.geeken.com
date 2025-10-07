import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  Put,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ResponseInterceptor } from "../../common/interceptors/response.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { OrderStatus } from "../../common/enums/order-status.enum";

@ApiTags("orders")
@Controller("admin/orders")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new order" })
  @ApiResponse({ status: 201, description: "Order created successfully" })
  @Permissions("create_order")
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user) {
    return this.ordersService.create(createOrderDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all orders with pagination and search" })
  @ApiResponse({ status: 200, description: "Orders retrieved successfully" })
  @Permissions("read_order")
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ordersService.findAll(paginationDto);
  }

  @Get("deleted")
  @ApiOperation({
    summary: "Get all soft-deleted orders with pagination and search",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted orders retrieved successfully",
  })
  @Permissions("read_order")
  findDeletedOrders(@Query() paginationDto: PaginationDto) {
    return this.ordersService.findDeletedOrders(paginationDto);
  }

  @Get("my-orders")
  @ApiOperation({ summary: "Get current user orders" })
  @ApiResponse({
    status: 200,
    description: "User orders retrieved successfully",
  })
  findMyOrders(@CurrentUser() user) {
    return this.ordersService.findByUser(user.id);
  }

  @Get("statistics")
  @ApiOperation({ summary: "Get order statistics" })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
  })
  @Permissions("read_order")
  getStatistics() {
    return this.ordersService.getOrderStatistics();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get order by ID" })
  @ApiResponse({ status: 200, description: "Order retrieved successfully" })
  @Permissions("read_order")
  findOne(@Param("id") id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update order by ID" })
  @ApiResponse({ status: 200, description: "Order updated successfully" })
  @Permissions("update_order")
  update(@Param("id") id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update order status" })
  @ApiResponse({
    status: 200,
    description: "Order status updated successfully",
  })
  @Permissions("update_order")
  updateStatus(@Param("id") id: string, @Body("status") status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(":id/confirm")
  @ApiOperation({ summary: "Confirm order" })
  @ApiResponse({ status: 200, description: "Order confirmed successfully" })
  @Permissions("update_order")
  confirmOrder(@Param("id") id: string) {
    return this.ordersService.confirmOrder(id);
  }

  @Patch(":id/complete")
  @ApiOperation({ summary: "Complete order" })
  @ApiResponse({ status: 200, description: "Order completed successfully" })
  @Permissions("update_order")
  completeOrder(@Param("id") id: string) {
    return this.ordersService.completeOrder(id);
  }

  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancel order" })
  @ApiResponse({ status: 200, description: "Order cancelled successfully" })
  @Permissions("update_order")
  cancelOrder(@Param("id") id: string, @Body("reason") reason?: string) {
    return this.ordersService.cancelOrder(id, reason);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete order by ID" })
  @ApiResponse({ status: 200, description: "Order deleted successfully" })
  @Permissions("delete_order")
  remove(@Param("id") id: string) {
    return this.ordersService.remove(id);
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted order by ID" })
  @ApiResponse({ status: 200, description: "Order restored successfully" })
  @Permissions("update_order")
  restore(@Param("id") id: string) {
    return this.ordersService.restore(id);
  }

  @Patch("bulk")
  @ApiOperation({ summary: "Update status orders by IDs" })
  @ApiResponse({ status: 200, description: "Orders updated successfully" })
  @Permissions("update_order")
  async updateStatusByIds(@Body() body: UpdateOrderStatusDto) {
    const { ids, status } = body;
    return this.ordersService.updateStatusByIds(ids, status);
  }
}

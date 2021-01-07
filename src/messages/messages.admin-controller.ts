import {
  Controller,
  Body,
  Post,
  Param,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserOrExternalServiceAuthGuard } from '../auth/guards/user-or-external-service-auth.guard';
import { AuthData } from '../auth/decorators/auth-data.decorator';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { ExtendedValidationPipe } from '../common/pipes/extended-validation.pipe';
import { ValidationGroup } from '../common/constants/validation-group.enum';
import { ChatPathForMongoDto } from '../chats/dto/chat-path-for-mongo.dto';
import { CreateMessageInMongoDto } from './dto/create-message-in-mongo.dto';
import { Types } from 'mongoose';
import { GetMessagesFromMongoFiltersDto } from './dto/get-messages-from-mongo-filters.dto';
import { PaginatedMessagesFromMongoDto } from './dto/paginated-messages-from-mongo.dto';

@Controller()
@ApiTags('Messages')
export class MessagesAdminController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('admin-api/chats/:chatId/messages')
  @UsePipes(
    ExtendedValidationPipe(
      {
        whitelist: true,
        transform: true,
      },
      req => [
        ValidationGroup.ALL,
        req.user.isExternalService
          ? ValidationGroup.EXT_SER
          : ValidationGroup.USER,
      ],
    ),
  )
  @UseGuards(UserOrExternalServiceAuthGuard)
  @ApiCreatedResponse({ type: () => Object })
  async createMessage(
    @Param() { chatId }: ChatPathForMongoDto,
    @Body() createDto: CreateMessageInMongoDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<any> {
    return (
      await this.messagesService.createMessageInMongo({
        ...createDto,
        chatId: new Types.ObjectId(chatId),
        userId:
          createDto.userId !== null || createDto.userId !== undefined
            ? new Types.ObjectId(createDto.userId)
            : new Types.ObjectId(authData.user.id),
      })
    ).toJSON();
  }

  @Get('admin-api/chats/:chatId/messages')
  @UseGuards(UserOrExternalServiceAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  @ApiOkResponse({ type: () => Object, isArray: true })
  async getMessages(
    @Param() { chatId }: ChatPathForMongoDto,
    @Query() filters: GetMessagesFromMongoFiltersDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<PaginatedMessagesFromMongoDto> {
    return this.messagesService.getPaginatedMessagesFromMongoConsideringAccessRights(
      authData,
      Types.ObjectId(chatId),
      filters,
    );
  }
}
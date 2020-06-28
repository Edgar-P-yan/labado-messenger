import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiBasicAuth } from '@nestjs/swagger';
import { AccessTokenDto } from './dto/AccessToken.dto';
import { AuthService } from './auth.service';
import { ExternalServiceGuard } from './guards/ExternalServiceGuard.guard';
import { UserPathDto } from '../users/dto/UserPath.dto';

@Controller()
@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('users/:userId/createAccessToken')
  @UseGuards(ExternalServiceGuard)
  @ApiBasicAuth()
  @ApiCreatedResponse({ type: () => AccessTokenDto })
  async getAccessTokenForUser(
    @Param() { userId }: UserPathDto,
  ): Promise<AccessTokenDto> {
    return this.authService.createAccessTokenByUserId(userId);
  }
}

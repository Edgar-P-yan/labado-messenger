import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformJson } from '../../common/utils/transform-json.util';

export class ChatsQueryDto {
  @ApiPropertyOptional({
    type: 'string',
    enum: ['NEWER_FIRST', 'UNREAD_FIRST'],
    description: 'Default: `NEWER_FIRST`',
  })
  @IsString()
  @IsIn(['NEWER_FIRST', 'UNREAD_FIRST'])
  @IsOptional()
  sort?: 'NEWER_FIRST' | 'UNREAD_FIRST';

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @Transform(transformJson)
  @IsObject()
  @IsOptional()
  externalMetadata?: Record<string, unknown>;
}

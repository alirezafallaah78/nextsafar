import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateAvatarDto {
  @IsString()
  @IsOptional()
  @MaxLength(5242880) // 5MB - برای تصاویر base64
  avatar?: string | null;
}

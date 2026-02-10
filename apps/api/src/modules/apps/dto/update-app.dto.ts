import { IsOptional, IsString } from "class-validator";

export class UpdateAppDto {
  @IsOptional()
  @IsString()
  partnerAppGid?: string;

  @IsOptional()
  @IsString()
  partnerAppName?: string;
}

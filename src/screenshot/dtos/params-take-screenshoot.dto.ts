import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  Matches,
} from 'class-validator';
import { Format } from '../adapters/screen-shooter/params-take-screen-shoot';

export class ParamsTakeScreenShootDto {
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  element?: string;

  @IsNotEmpty()
  filename: string;

  format: Format = Format.PNG;

  quality = 100;

  isFullPage = false;

  @IsOptional()
  @Matches(
    /^([0-9]){4}-([0-9]){2}-([0-9]){2}\s([0-9]){2}:([0-9]){2}:([0-9]){2}$/g,
  )
  scheduledAt: string;

  @IsOptional()
  @IsUrl()
  webhookUrl: string;
}

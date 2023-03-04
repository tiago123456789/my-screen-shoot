import { JwtPayloadDto } from '../dtos/jwt-payload.dto';

export interface IJwtAdapter {
  generate(jwtPayloadDto: JwtPayloadDto): Promise<string>;
  verify(token: string): Promise<boolean | JwtPayloadDto>;
}

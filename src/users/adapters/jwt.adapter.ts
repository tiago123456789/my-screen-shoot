import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from '../dtos/jwt-payload.dto';
import { IJwtAdapter } from './ijwt.adapter';

@Injectable()
export class JwtAdapter implements IJwtAdapter {
  constructor(private readonly jwtService: JwtService) {}

  generate(jwtPayloadDto: JwtPayloadDto): Promise<string> {
    return this.jwtService.signAsync(jwtPayloadDto);
  }

  async verify(token: string): Promise<boolean | JwtPayloadDto> {
    try {
      token = token.replace('Bearer ', '');
      const payload: JwtPayloadDto = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      return false;
    }
  }
}

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
const basePath = path.resolve(__dirname, '../../../../');
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // secretOrKey: configService.get<string>('JWT_SECRET'),
      secretOrKey: fs.readFileSync(path.resolve(basePath, 'keys/public.key'), 'utf8'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      permissions: payload.permissions,
    };
  }
}
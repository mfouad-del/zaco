import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_prod',
    });
  }

  async validate(payload: any) {
    // Map JWT payload to an object with an `id` property expected by the app
    return { id: payload.sub, email: payload.email, role: payload.role, companyId: payload.companyId };
  }
}

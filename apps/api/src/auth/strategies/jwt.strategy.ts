import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret-key-for-development',
    });
  }

  async validate(payload: any) {
    // هر دو فیلد را برمی‌گردانیم تا با هر کدی سازگار باشد
    return { 
      userId: payload.sub,
      sub: payload.sub,  // ← اضافه شد برای سازگاری
      mobile: payload.mobile, 
      roles: payload.roles 
    };
  }
}

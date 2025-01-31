import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signToken(user: any) {
    const payload = {
      userId: user.id,
      role: user?.role,
      name: user?.name,
      email: user?.email,
    };
    const token = this.jwtService.sign(payload);
    console.log('Genarted Token ', token);

    return `Bearer ${token}`;
  }

  async validateToken(token: string) {
    try {
      const decode = await this.jwtService.decode(token);
      return decode;
    } catch (error) {
      console.log('validateToken, ', error);
      return null;
    }
  }
}

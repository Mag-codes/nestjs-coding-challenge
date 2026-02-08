import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<{ headers: { authorization?: string } }>();
    const authHeader = req.headers?.authorization;
    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token');
    }
    const token = authHeader.substring(7);
    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }
    return super.canActivate(context) as Promise<boolean>;
  }
}

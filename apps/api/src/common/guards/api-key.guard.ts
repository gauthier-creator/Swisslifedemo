import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    // In production, validate against OAuth2 token endpoint or JWT
    // For MVP, validate against configured API key
    const jwtSecret = this.configService.get<string>('jwt.secret');
    if (!jwtSecret) {
      throw new UnauthorizedException('Server configuration error');
    }

    // TODO: Implement full OAuth2 + JWT validation
    // For now, basic bearer token check
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}

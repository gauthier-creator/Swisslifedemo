import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export enum Role {
  ADVISOR = 'advisor',
  ADVISOR_MANAGER = 'advisor_manager',
  COMPLIANCE_OFFICER = 'compliance_officer',
  HEAD_OF_COMPLIANCE = 'head_of_compliance',
  ADMIN = 'admin',
  READONLY = 'readonly',
}

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}

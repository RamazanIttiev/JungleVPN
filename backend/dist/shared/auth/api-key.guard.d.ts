import { type CanActivate, type ExecutionContext } from '@nestjs/common';
export declare class ApiKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}

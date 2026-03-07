import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { supabaseAdmin } from "@config";
import { UserRepository } from "@core/repositories";

import { IS_PUBLIC_KEY } from "../decorators";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Access token is required");
    }

    try {
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException("Invalid or expired token");
      }

      // Anonymous users or explicitly new users might not have a profile yet in public.users
      const userEntity = await this.userRepository.findById(user.id);

      // If user is from Supabase Auth but no profile exists, attach a partial/empty entity
      // or null so controllers can handle it (like GetProfile does).
      request.user = userEntity || null;
      // We attach the raw supabase user as well in case controllers need the metadata
      request.supabaseUser = user;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Authentication failed");
    }
  }

  private extractTokenFromHeader(request: {
    headers: { authorization?: string };
  }): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization || typeof authorization !== "string") {
      return undefined;
    }
    const [type, token] = authorization.split(" ");
    return type === "Bearer" ? token : undefined;
  }
}

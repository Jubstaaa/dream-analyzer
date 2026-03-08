import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { I18nContext } from "nestjs-i18n";

import { supabaseAdmin } from "@config";
import { UserRepository } from "@core/repositories";
import {
  InvalidTokenException,
  MissingTokenException,
  UnauthorizedAccessException,
} from "@core/exceptions";

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
      // If I18nContext is not available fallback to english text
      const i18n = I18nContext.current();
      const message = i18n
        ? i18n.t("auth.missingToken", {
            defaultValue: "Access token is required",
          })
        : "Access token is required";

      throw new MissingTokenException(message);
    }

    try {
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        const i18n = I18nContext.current();
        const message = i18n
          ? i18n.t("auth.invalidToken", {
              defaultValue: "Invalid or expired token",
            })
          : "Invalid or expired token";
        throw new InvalidTokenException(message);
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
      const i18n = I18nContext.current();
      if (
        error instanceof InvalidTokenException ||
        error instanceof MissingTokenException ||
        error instanceof UnauthorizedAccessException
      ) {
        throw error;
      }

      const message = i18n
        ? i18n.t("auth.unauthorized", {
            defaultValue: "Authentication failed",
          })
        : "Authentication failed";

      throw new UnauthorizedAccessException(message);
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

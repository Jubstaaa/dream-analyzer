import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import { I18nContext } from "nestjs-i18n";
import { ZodValidationException } from "nestjs-zod";

interface ZodIssueBase {
  code: string;
  path: (string | number)[];
  message: string;
  minimum?: number;
  maximum?: number;
}

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const i18n = I18nContext.current(host);

    const zodError = exception.getZodError() as { issues: ZodIssueBase[] };
    const issues = zodError?.issues ?? [];

    const errors = issues.map((issue: ZodIssueBase) => {
      const field = issue.path.join(".");
      const translatedMessage = this.translateError(issue, field, i18n);

      return {
        field,
        code: issue.code,
        message: translatedMessage,
      };
    });

    response.status(400).json({
      statusCode: 400,
      message: i18n?.t("common.validation.failed") ?? "Validation failed111",
      errors,
    });
  }

  private translateError(
    issue: ZodIssueBase,
    field: string,
    i18n: I18nContext | undefined,
  ): string {
    if (!i18n) {
      return issue.message;
    }

    const fieldName = this.translateFieldName(field, i18n);

    switch (issue.code) {
      case "too_small":
        return String(
          i18n.t("common.validation.minLength", {
            args: { field: fieldName, min: issue.minimum ?? 0 },
          }),
        );

      case "too_big":
        return String(
          i18n.t("common.validation.maxLength", {
            args: { field: fieldName, max: issue.maximum ?? 0 },
          }),
        );

      case "invalid_type":
        if (issue.message.includes("Required")) {
          return String(
            i18n.t("common.validation.required", {
              args: { field: fieldName },
            }),
          );
        }
        return String(
          i18n.t("common.validation.invalidType", {
            args: { field: fieldName },
          }),
        );

      case "invalid_string":
      case "invalid_format":
        if (issue.message.includes("email")) {
          return String(i18n.t("common.validation.email"));
        }
        return issue.message;

      case "invalid_enum_value":
      case "invalid_value":
        return String(
          i18n.t("common.validation.invalidEnum", {
            args: { field: fieldName },
          }),
        );

      default:
        return issue.message;
    }
  }

  private translateFieldName(field: string, i18n: I18nContext): string {
    const key = `common.fields.${field}`;
    const translated = String(i18n.t(key));

    if (translated === key) {
      return field.charAt(0).toUpperCase() + field.slice(1);
    }

    return translated;
  }
}

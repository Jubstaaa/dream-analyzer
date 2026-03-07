import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";
import { ZodValidationException } from "nestjs-zod";
import { ZodSchema } from "zod";

@Injectable()
export class CustomZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    const metatype = metadata.metatype;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const zodSchema =
      (metatype as unknown as { schema?: ZodSchema }).schema ||
      (metatype as unknown as { zodSchema?: ZodSchema }).zodSchema ||
      (metatype as unknown as { _schema?: ZodSchema })._schema;

    if (!zodSchema) {
      return value;
    }

    const result = zodSchema.safeParse(value);

    if (!result.success) {
      throw new ZodValidationException(result.error);
    }

    return result.data;
  }

  private toValidate(metatype: unknown): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype as typeof String);
  }
}

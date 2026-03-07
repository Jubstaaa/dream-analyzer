import { NotFoundException } from '@core/exceptions';

export class EntityHelper {
  static verifyOwnership<T extends { userId: string }>(
    entity: T | null,
    entityName: string,
    entityId: string,
    ownerId: string,
  ): T {
    if (!entity || entity.userId !== ownerId) {
      throw new NotFoundException(entityName, entityId);
    }
    return entity;
  }

  static verifyExists<T>(
    entity: T | null,
    entityName: string,
    entityId: string,
  ): T {
    if (!entity) {
      throw new NotFoundException(entityName, entityId);
    }
    return entity;
  }

  static buildPartialUpdate<T extends object>(
    dto: Partial<T>,
    allowedKeys: (keyof T)[],
  ): Partial<T> {
    const result: Partial<T> = {};
    for (const key of allowedKeys) {
      if (dto[key] !== undefined) {
        result[key] = dto[key];
      }
    }
    return result;
  }
}

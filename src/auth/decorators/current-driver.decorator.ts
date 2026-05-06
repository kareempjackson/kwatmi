import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentDriver = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const driver = request.driver;

    if (data) {
      return driver?.[data];
    }

    return driver;
  },
);

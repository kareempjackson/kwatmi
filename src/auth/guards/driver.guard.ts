import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DriverGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('Authentication required');
    }

    const driver = await this.prisma.driver.findFirst({
      where: { userId: user.sub },
    });

    if (!driver) {
      throw new ForbiddenException('Driver access required');
    }

    request.driver = driver;
    return true;
  }
}

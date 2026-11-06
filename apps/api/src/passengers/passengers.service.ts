import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PassengersService {
  constructor(private prisma: PrismaService) {}

  /**
   * دریافت لیست همه مسافران
   */
  async findAll(query: { page?: number; limit?: number; search?: string; userId?: string }) {
    const { page = 1, limit = 50, search, userId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { mobile: { contains: search } } },
      ];
    }

    const [passengers, total] = await Promise.all([
      this.prisma.passenger.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              mobile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.passenger.count({ where }),
    ]);

    return {
      data: passengers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * دریافت مسافران یک کاربر
   */
  async findByUser(userId: string) {
    return this.prisma.passenger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * ایجاد مسافر جدید
   */
  async create(userId: string, data: {
    firstName: string;
    lastName: string;
    nationalId: string;
    passportNumber?: string;
    birthDate: string;
    gender: string;
    relationship: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // بررسی تکراری نبودن کد ملی
    const existing = await this.prisma.passenger.findFirst({
      where: { nationalId: data.nationalId },
    });
    if (existing) {
      throw new BadRequestException('این کد ملی قبلاً ثبت شده است');
    }

    return this.prisma.passenger.create({
      data: {
        ...data,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mobile: true,
          },
        },
      },
    });
  }

  /**
   * بروزرسانی مسافر
   */
  async update(id: string, data: any) {
    const passenger = await this.prisma.passenger.findUnique({ where: { id } });
    if (!passenger) throw new NotFoundException('Passenger not found');

    // اگر nationalId تغییر می‌کند، بررسی تکراری نبودن
    if (data.nationalId && data.nationalId !== passenger.nationalId) {
      const existing = await this.prisma.passenger.findFirst({
        where: { nationalId: data.nationalId, NOT: { id } },
      });
      if (existing) {
        throw new BadRequestException('این کد ملی قبلاً ثبت شده است');
      }
    }

    return this.prisma.passenger.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mobile: true,
          },
        },
      },
    });
  }

  /**
   * حذف مسافر
   * فقط در صورتی حذف می‌شود که به OrderPassenger وصل نباشد
   * (به دلیل onDelete: SetNull، اگر وصل باشد، passengerId در OrderPassenger null می‌شود)
   */
  async remove(id: string) {
    const passenger = await this.prisma.passenger.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });
    
    if (!passenger) throw new NotFoundException('Passenger not found');

    // هشدار: حذف passenger باعث null شدن passengerId در OrderPassenger های متصل می‌شود
    // اما snapshot داده‌ها حفظ می‌شود
    
    await this.prisma.passenger.delete({ where: { id } });
    return { 
      success: true,
      message: passenger._count.orders > 0 
        ? `مسافر حذف شد. ${passenger._count.orders} سفارش مرتبط passengerId خود را از دست دادند (snapshot حفظ شد)`
        : 'مسافر با موفقیت حذف شد',
    };
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TourStatus } from '@prisma/client';
import {
  CreateAdminTourDto,
  UpdateAdminTourDto,
  AdminTourQueryDto,
  AdminTourStatus,
  TourDateDto,
  TourItineraryDto,
  TourServiceDto,
} from '../dto/admin-tour.dto';

@Injectable()
export class AdminToursService {
  constructor(private prisma: PrismaService) {}

  /* ═══════════════════════════════════════════ */
  /* Helper: map DTO → Prisma data               */
  /* ═══════════════════════════════════════════ */

  private mapDateDto(d: TourDateDto) {
    return {
      startDate: new Date(d.startDate),
      endDate: new Date(d.endDate),
      adultPrice: Number(d.adultPrice),
      childPrice: Number(d.childPrice ?? 0),
      infantPrice: Number(d.infantPrice ?? 0),
      singlePrice: d.singlePrice !== undefined ? Number(d.singlePrice) : null,
      totalCapacity: Number(d.totalCapacity),
      remainingCapacity: Number(d.remainingCapacity ?? d.totalCapacity),
      status: d.status || 'ACTIVE',
    };
  }

  private mapItineraryDto(it: TourItineraryDto) {
    return {
      dayNumber: Number(it.dayNumber),
      title: it.title,
      description: it.description ?? '',
      order: Number(it.order ?? it.dayNumber),
    };
  }

  private mapServiceDto(s: TourServiceDto) {
    return {
      name: s.name,
      description: s.description ?? '',
      isIncluded: s.isIncluded ?? true,
    };
  }

  /* ═══════════════════════════════════════════ */
  /* List all tours (admin - all statuses)       */
  /* ═══════════════════════════════════════════ */

  async findAll(query: AdminTourQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TourWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status as TourStatus;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.destinationId) {
      where.destinationId = query.destinationId;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.tour.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          destination: true,
          dates: { orderBy: { startDate: 'asc' } },
          _count: {
            select: { leads: true, hotelRelations: true },
          },
        },
      }),
      this.prisma.tour.count({ where }),
    ]);

    const enriched = data.map((tour) => {
      const activeDates = tour.dates.filter((d) => d.status === 'ACTIVE');
      const lowestPrice =
        activeDates.length > 0
          ? Math.min(...activeDates.map((d) => Number(d.adultPrice)))
          : 0;
      const nextDate = activeDates.length > 0 ? activeDates[0].startDate : null;

      return {
        ...tour,
        lowestPrice,
        nextDate,
        datesCount: tour.dates.length,
        activeDatesCount: activeDates.length,
      };
    });

    return {
      success: true,
      data: enriched,
      meta: {
        page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  /* ═══════════════════════════════════════════ */
  /* Get one tour with full details              */
  /* ═══════════════════════════════════════════ */

  async findOne(id: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        category: true,
        destination: true,
        dates: { orderBy: { startDate: 'asc' } },
        itineraries: { orderBy: { dayNumber: 'asc' } },
        services: true,
        hotelRelations: { include: { hotel: true } },
        leads: { take: 10, orderBy: { createdAt: 'desc' } },
        _count: { select: { leads: true, hotelRelations: true } },
      },
    });

    if (!tour) throw new NotFoundException('Tour not found');

    return { success: true, data: tour };
  }

  /* ═══════════════════════════════════════════ */
  /* Create new tour                             */
  /* ═══════════════════════════════════════════ */

  async create(dto: CreateAdminTourDto) {
    const existing = await this.prisma.tour.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Slug "${dto.slug}" is already taken`);
    }

    const tour = await this.prisma.tour.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description ?? null,
        categoryId: dto.categoryId || null,
        destinationId: dto.destinationId || null,
        status: (dto.status as TourStatus) ?? TourStatus.DRAFT,
        durationDays: dto.durationDays ?? null,
        durationNights: dto.durationNights ?? null,
        transportType: dto.transportType ?? null,
        images: dto.images ?? undefined,
        dates: dto.dates?.length
          ? { create: dto.dates.map((d) => this.mapDateDto(d)) }
          : undefined,
        itineraries: dto.itineraries?.length
          ? { create: dto.itineraries.map((it) => this.mapItineraryDto(it)) }
          : undefined,
        services: dto.services?.length
          ? { create: dto.services.map((s) => this.mapServiceDto(s)) }
          : undefined,
      },
      include: {
        category: true,
        destination: true,
        dates: true,
        itineraries: true,
        services: true,
      },
    });

    return { success: true, data: tour };
  }

  /* ═══════════════════════════════════════════ */
  /* Update existing tour                        */
  /* ═══════════════════════════════════════════ */

  async update(id: string, dto: UpdateAdminTourDto) {
    const existing = await this.prisma.tour.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tour not found');

    if (dto.slug && dto.slug !== existing.slug) {
      const conflict = await this.prisma.tour.findUnique({
        where: { slug: dto.slug },
      });
      if (conflict) {
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // حذف relations قدیمی
      await tx.tourDate.deleteMany({ where: { tourId: id } });
      await tx.tourItinerary.deleteMany({ where: { tourId: id } });
      await tx.tourService.deleteMany({ where: { tourId: id } });

      const updated = await tx.tour.update({
        where: { id },
        data: {
          title: dto.title,
          slug: dto.slug,
          description: dto.description ?? null,
          categoryId: dto.categoryId || null,
          destinationId: dto.destinationId || null,
          status: (dto.status as TourStatus) ?? existing.status,
          durationDays: dto.durationDays ?? null,
          durationNights: dto.durationNights ?? null,
          transportType: dto.transportType ?? null,
          images: dto.images ?? undefined,
          dates: dto.dates?.length
            ? { create: dto.dates.map((d) => this.mapDateDto(d)) }
            : undefined,
          itineraries: dto.itineraries?.length
            ? { create: dto.itineraries.map((it) => this.mapItineraryDto(it)) }
            : undefined,
          services: dto.services?.length
            ? { create: dto.services.map((s) => this.mapServiceDto(s)) }
            : undefined,
        },
        include: {
          category: true,
          destination: true,
          dates: true,
          itineraries: true,
          services: true,
        },
      });

      return { success: true, data: updated };
    });
  }

  /* ═══════════════════════════════════════════ */
  /* Delete tour                                 */
  /* ═══════════════════════════════════════════ */

  async remove(id: string) {
    const existing = await this.prisma.tour.findUnique({
      where: { id },
      include: { _count: { select: { leads: true } } },
    });
    if (!existing) throw new NotFoundException('Tour not found');

    if (existing._count.leads > 0) {
      throw new ConflictException(
        `Cannot delete: tour has ${existing._count.leads} leads. Archive it instead.`,
      );
    }

    await this.prisma.tour.delete({ where: { id } });
    return { success: true, message: 'Tour deleted' };
  }

  /* ═══════════════════════════════════════════ */
  /* Quick status change                         */
  /* ═══════════════════════════════════════════ */

  async changeStatus(id: string, status: AdminTourStatus) {
    const existing = await this.prisma.tour.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tour not found');

    const tour = await this.prisma.tour.update({
      where: { id },
      data: { status: status as TourStatus },
    });

    return { success: true, data: tour };
  }
}

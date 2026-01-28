import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { Prisma, Customer } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    try {
      return await this.prisma.customer.create({
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Customer with given email or phone already exists',
        );
      }
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    data: Customer[];
  }> {
    if (limit <= 0) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    if (page <= 0) {
      throw new BadRequestException('Page must be greater than 0');
    }

    const skip = (page - 1) * limit;

    const [data, totalRecords] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count(),
    ]);

    return {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      data,
    };
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    await this.findOne(id);

    try {
      return await this.prisma.customer.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Customer with given email or phone already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Customer> {
    await this.findOne(id);

    return this.prisma.customer.delete({
      where: { id },
    });
  }
}

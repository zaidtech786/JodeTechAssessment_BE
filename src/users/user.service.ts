import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import {  Model } from 'mongoose';

import { faker } from '@faker-js/faker';
import { IUser } from './user.interface';

export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<IUser>) {}       

  async generateUsers(total: number) {
  const batchSize = 1000;
  let inserted = 0;

  while (inserted < total) {
    const users: Partial<User>[] = [];
    const batchLimit = Math.min(batchSize, total - inserted);

    for (let i = 0; i < batchLimit; i++) {
      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        age: faker.number.int({ min: 18, max: 80 }),
      });
    }

    await this.userModel.insertMany(users);
    inserted += batchLimit;
    console.log(`Inserted ${inserted} users so far...`);
  }

  console.log('All users generated and inserted.');
}

async fetchUsers(page: number = 1, limit: number = 10, date?: Date) {
  try {
    const skip = (page - 1) * limit;

    let filter: any = {};

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(start.getDate() + 1);

      filter.createdAt = { $gte: start, $lt: end };
    }

    const users = await this.userModel.find(filter).skip(skip).limit(limit);
    const total = await this.userModel.countDocuments(filter);

    return {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      users,
    };
  } catch (error) {
    console.error('Error fetching users with pagination:', error);
    throw new Error('Internal server error');
  }
}

async fetchAllUsers(date?: string) {
  const query: any = {};
  if (date) {
    const selectedDate = new Date(date);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + 1);

    query.createdAt = { $gte: selectedDate, $lt: nextDate };
  }

  return await this.userModel.find(query).lean(); // use .lean() for plain objects
}


// user.service.ts
async getUsersForExcel(date?: string) {
  const query: any = {};
  if (date) {
    const selectedDate = new Date(date);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + 1);

    query.createdAt = { $gte: selectedDate, $lt: nextDate };
  }
  return this.userModel.find(query);
}



}

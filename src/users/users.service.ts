import { Injectable, NotFoundException } from '@nestjs/common';
import knexDB from 'src/db/knex.db';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private saltOrRounds: number;

  constructor() {
    this.saltOrRounds = 12;
  }

  async getUserByEmail(email: string) {
    try {
      const user = await knexDB('users').where({ email }).first();
      if (!user) {
        throw new NotFoundException('User Not found By Mail');
      }
      return user;
    } catch (error) {
      console.log('getUserByEmail Error ', error);
      return null;
    }
  }
  async getUserByUserName(userName: string) {
    try {
      const user = await knexDB('users').where({ user_name: userName }).first();
      if (!user) {
        throw new NotFoundException('User Not found By UserName');
      }
      return user;
    } catch (error) {
      console.log('getUserByUserName Error ', error);
      return null;
    }
  }
  async getUserById(userId: string) {
    return await knexDB('users').where({ id: userId }).first();
  }

  async getUsers() {
    return await knexDB('users').select('*');
  }

  async addUser(user: {
    name: string;
    userName: string;
    email: string;
    password: string;
  }) {
    try {
      const { name, userName, email, password } = user;
      const hashedPassword = await bcrypt.hash(password, this.saltOrRounds);

      const [newUser] = await knexDB('users')
        .insert({
          name,
          user_name: userName,
          email,
          password: hashedPassword,
        })
        .returning('*');

      return {
        status: true,
        message: 'User Added Successfully',
        user: newUser,
      };
    } catch (error) {
      console.log('User Add Failed');
      return {
        status: false,
        message: 'User Add failed',
        user: null,
      };
    }
  }

  async updateUserToAgent(id: string) {
    try {
      const [newUser] = await knexDB('users')
        .where({ id })
        .update({
          role: 'agent',
        })
        .returning('*');

      const [agent] = await knexDB('agent')
        .insert({
          name: newUser.name,
          user: newUser?.id,
        })
        .returning('*');

      return {
        status: true,
        message: 'User Updated to Agent Successfully',
        user: newUser,
      };
    } catch (error) {
      console.log('User Add Failed', error);
      return {
        status: false,
        message: 'User Add failed',
        user: null,
      };
    }
  }

  async validatePassword(dbPassword: string, password: string) {
    const isValid = await bcrypt.compare(password, dbPassword);
    return isValid;
  }
}

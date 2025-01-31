import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/roles/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly userServices: UsersService) {}

  @Post()
  async addUser(
    @Body()
    user: {
      name: string;
      userName: string;
      email: string;
      password: string;
    },
  ) {
    try {
      return this.userServices.addUser(user);
    } catch (error) {
      return { staus: false, message: 'User add failed', user: null };
    }
  }

  // @Roles('admin', 'agent', 'customer')
  @Get(':id')
  async getUser(@Param('id') userId: string) {
    try {
      const user = await this.userServices.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found By ID');
      }
      return { response: user, status: true, message: 'User found by ID' };
    } catch (error) {
      return { staus: false, message: 'User not found by ID', response: null };
    }
  }

  // @Roles('admin')
  @Post('/make-agent')
  async makeUserRoleAgent(@Body() user: { id: string }) {
    try {
      const updateUser = await this.userServices.updateUserToAgent(user?.id);
      if (!updateUser) {
        throw new Error('Make User to agent failed');
      }
      return {
        response: updateUser,
        status: true,
        message: 'User upgraded to agent',
      };
    } catch (error) {
      return { staus: false, message: 'User upadet failed', response: null };
    }
  }

  // @Roles('admin', 'agent')
  @Get()
  async getAllUser() {
    try {
      const users = await this.userServices.getUsers();
      if (!users) {
        throw new NotFoundException('Users not found');
      }
      return { response: users, status: true, message: 'User found by ID' };
    } catch (error) {
      return { staus: false, message: 'User not found by ID', user: null };
    }
  }
}

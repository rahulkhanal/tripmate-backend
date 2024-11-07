import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/RegisterUserDto';
import { LoginUserDto } from './dto/LoginUserDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user as SuperAdmin or Visitor' })
  @ApiQuery({ name: 'userType', enum: ['superAdmin', 'visitor'], required: true })
  async register(
    @Query('userType') userType: 'superAdmin' | 'visitor',
    @Body() registerUserDto: RegisterUserDto,
  ) {
    if (userType === 'superAdmin') {
      return await this.authService.registerSuperAdmin(registerUserDto);
    } else if (userType === 'visitor') {
      return await this.authService.registerVisitor(registerUserDto);
    } else {
      throw new BadRequestException('Invalid userType');
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user', description: 'Login a user' })
  @ApiQuery({ name: 'userType', enum: ['superAdmin', 'visitor'], required: true })
  async login(@Query('userType') userType: 'superAdmin' | 'visitor', @Body() createAuthDto: LoginUserDto) {
    const { email, password } = createAuthDto;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    return await this.authService.login(userType, email, password);
  }

}

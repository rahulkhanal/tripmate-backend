import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SuperAdmin } from 'src/entities/super_admin.entity';
import { VisitorEntity } from 'src/entities/visitor.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/RegisterUserDto';
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
require('dotenv').config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SuperAdmin)
    private superAdminRepository: Repository<SuperAdmin>,

    @InjectRepository(VisitorEntity)
    private visitorRepository: Repository<VisitorEntity>,

    private jwtService: JwtService,
  ) { }

  async registerSuperAdmin(registerUserDto: RegisterUserDto): Promise<SuperAdmin> {
    const data = await this.superAdminRepository.find();
    if (data.length > 0) {
      throw new ForbiddenException('SuperAdmin already exists');
    }
    const { password } = registerUserDto;
    const hashedPassword = await argon.hash(password);

    const superAdmin = this.superAdminRepository.create({ password_hash: hashedPassword, ...registerUserDto });
    return this.superAdminRepository.save(superAdmin);
  }

  async registerVisitor(registerUserDto: RegisterUserDto): Promise<VisitorEntity> {
    const { password } = registerUserDto;
    const hashedPassword = await argon.hash(password);
    const visitor = this.visitorRepository.create({ password_hash: hashedPassword, ...registerUserDto });
    return this.visitorRepository.save(visitor);
  }

  async login(userType: 'superAdmin' | 'visitor', email: string, password: string) {
    if (userType === 'superAdmin') {
      const authUser = await this.superAdminRepository.findOne({
        where: { email },
      });
      if (!authUser) {
        throw new UnauthorizedException("Credentials not found")
      }
      const status = await argon.verify(authUser.password_hash, password)
      if (!status) {
        throw new UnauthorizedException("Credential doesn't match")
      }

      const expirationTimeInSeconds = '30d';
      const token = await this.jwtService.signAsync({ id: authUser.id, role: "super_admin" }, {
        secret: process.env.JWT_SECRET,
        expiresIn: expirationTimeInSeconds,
      });
      return { token, message: 'Login successful' };
    } else if (userType === 'visitor') {
      const authUser = await this.visitorRepository.findOne({
        where: { email },
      });
      if (!authUser) {
        throw new UnauthorizedException("Credentials not found")
      }
      const status = await argon.verify(authUser.password_hash, password)
      if (!status) {
        throw new UnauthorizedException("Credential doesn't match")
      }

      const expirationTimeInSeconds = '30d';
      const token = await this.jwtService.signAsync({ id: authUser.id, role: "visitor" }, {
        secret: process.env.JWT_SECRET,
        expiresIn: expirationTimeInSeconds,
      });
      return { token, message: 'Login successful' };
    } else {
      throw new BadRequestException('Invalid userType');
    }
  }
}

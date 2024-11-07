import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SuperAdmin } from 'src/entities/super_admin.entity';
import { VisitorEntity } from 'src/entities/visitor.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/RegisterUserDto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SuperAdmin)
    private superAdminRepository: Repository<SuperAdmin>,

    @InjectRepository(VisitorEntity)
    private visitorRepository: Repository<VisitorEntity>,
  ) { }

  async registerSuperAdmin(registerUserDto: RegisterUserDto): Promise<SuperAdmin> {
    const superAdmin = this.superAdminRepository.create(registerUserDto);
    return this.superAdminRepository.save(superAdmin);
  }
  
  async registerVisitor(registerUserDto: RegisterUserDto): Promise<VisitorEntity> {
    const visitor = this.visitorRepository.create(registerUserDto);
    return this.visitorRepository.save(visitor);
  }
}

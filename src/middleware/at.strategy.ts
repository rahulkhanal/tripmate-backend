import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';


@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        config: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('JWT_SECRET'),
            ignoreExpiration: false,
            passReqToCallback: true,

        });
    }

    async validate(req: Request, payload) {
        const refreshToken = req.get('Authorization').replace('Bearer ', '');
        return {
            ...payload,
            refreshToken,
        };
    }
} 
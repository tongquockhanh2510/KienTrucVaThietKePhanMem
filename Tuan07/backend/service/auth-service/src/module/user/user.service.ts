import { Injectable, BadRequestException } from "@nestjs/common";
import { MariaService } from "../../prisma/maria/maria.service";
import { User } from "@prisma/client";
import { RegisterDto } from "../auth/dto/registerDto";

type PublicUser = Omit<User, 'password'>;

@Injectable()
export class UserService {
    constructor(
        private readonly mariaService: MariaService
    ) { }

    async findOne(userId: number): Promise<User | null> {
        return this.mariaService.user.findUnique({ where: { id: userId } });
    }

    async findAllPublic(): Promise<PublicUser[]> {
        return this.mariaService.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    }

    async findPublicById(userId: number): Promise<PublicUser | null> {
        return this.mariaService.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    }

    async findOneByUsername(username: string): Promise<User | null> {
        return this.mariaService.user.findUnique({ where: { username } });
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.mariaService.user.findUnique({ where: { email } });
    }

    async create(registerDto: RegisterDto): Promise<User> {
        const existingUser = await this.findOneByEmail(registerDto.email);
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }
        return this.mariaService.user.create({
            data: {
                email: registerDto.email,
                password: registerDto.password,
                username: registerDto.username,
                role: 'USER',
            },
        });
    }
}
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../common/db/prisma.service";
export declare class AuthService {
    private jwt;
    private prisma;
    constructor(jwt: JwtService, prisma: PrismaService);
    login(email: string, password: string): Promise<{
        access_token: string;
        token_type: string;
    }>;
}

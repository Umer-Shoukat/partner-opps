import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { PrismaService } from "../../common/db/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive)
      throw new UnauthorizedException("invalid_credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("invalid_credentials");

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { access_token: token, token_type: "Bearer" };
  }
}

// @Injectable()
// export class AuthService {
//   constructor(private jwt: JwtService) {}

//   async login(email: string, password: string) {
//     const adminEmail = process.env.ADMIN_EMAIL || "admin@appops.local";
//     const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

//     if (email !== adminEmail || password !== adminPassword) {
//       throw new UnauthorizedException("invalid_credentials");
//     }

//     const token = await this.jwt.signAsync({
//       sub: "admin",
//       email,
//       role: "admin",
//     });
//     return { access_token: token, token_type: "Bearer" };
//   }
// }

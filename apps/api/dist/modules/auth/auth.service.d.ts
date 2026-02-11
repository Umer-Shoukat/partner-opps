import { JwtService } from "@nestjs/jwt";
export declare class AuthService {
    private jwt;
    constructor(jwt: JwtService);
    login(email: string, password: string): Promise<{
        access_token: string;
        token_type: string;
    }>;
}

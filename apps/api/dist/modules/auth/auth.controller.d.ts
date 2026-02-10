import { AuthService } from './auth.service';
import { Request } from 'express';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        token_type: string;
    }>;
    me(req: Request & {
        user?: any;
    }): Promise<any>;
}

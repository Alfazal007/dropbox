import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            machine_count: number;
            user_id: number;
            username: string;
            token: string;
        }
    }
}


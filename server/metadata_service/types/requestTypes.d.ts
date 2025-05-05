import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            machine_count: number;
            username: string;
            token: string;
        }
    }
}


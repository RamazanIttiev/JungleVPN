import { UsersService } from './users.service';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    ensure(telegramId: string, _apiKey: string): Promise<{
        id: string;
    }>;
}

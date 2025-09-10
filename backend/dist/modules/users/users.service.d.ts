import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private readonly repo;
    constructor(repo: Repository<User>);
    findOrCreateByTelegramId(telegramId: string): Promise<User>;
    setActive(userId: string, active: boolean): Promise<void>;
}

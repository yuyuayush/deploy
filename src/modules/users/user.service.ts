import { User, CreateUserInput, UpdateUserInput } from './user.types.js';
import { ApiError } from '../../utils/api-error.js';

// In-memory data store for demonstration (can easily be replaced with Prisma, TypeORM, Knex, etc.)
const usersStore: Map<string, User> = new Map([
  [
    '123e4567-e89b-12d3-a456-426614174000',
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    '987e6543-e21b-12d3-a456-426614174000',
    {
      id: '987e6543-e21b-12d3-a456-426614174000',
      name: 'Sarah Connor',
      email: 'sarah.connor@example.com',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

export class UserService {
  public async getAllUsers(): Promise<User[]> {
    return Array.from(usersStore.values());
  }

  public async getUserById(id: string): Promise<User> {
    const user = usersStore.get(id);
    if (!user) {
      throw ApiError.notFound(`User with ID '${id}' was not found`);
    }
    return user;
  }

  public async createUser(input: CreateUserInput): Promise<User> {
    // Check email uniqueness
    const existingUser = Array.from(usersStore.values()).find(
      (user) => user.email.toLowerCase() === input.email.toLowerCase()
    );
    if (existingUser) {
      throw ApiError.conflict(`User with email '${input.email}' already exists`);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newUser: User = {
      id,
      name: input.name,
      email: input.email,
      role: input.role || 'user',
      createdAt: now,
      updatedAt: now,
    };

    usersStore.set(id, newUser);
    return newUser;
  }

  public async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const existingUser = await this.getUserById(id);

    if (input.email && input.email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailTaken = Array.from(usersStore.values()).find(
        (user) => user.email.toLowerCase() === input.email?.toLowerCase() && user.id !== id
      );
      if (emailTaken) {
        throw ApiError.conflict(`Email '${input.email}' is already in use`);
      }
    }

    const updatedUser: User = {
      ...existingUser,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    usersStore.set(id, updatedUser);
    return updatedUser;
  }

  public async deleteUser(id: string): Promise<void> {
    await this.getUserById(id);
    usersStore.delete(id);
  }
}

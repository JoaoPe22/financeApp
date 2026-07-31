// Tipos do domínio "usuário", usados por src/services/usuarios.ts e src/hooks/use-usuarios.ts
// (gestão de usuários feita por um admin via authClient.admin.*)
import type { UserRole } from '@projeto-saas/api/src/auth/permissions'

type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: UserRole;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
}

type ListUsersResponse = {
  users: User[];
  total: number;
  limit?: number;
  offset?: number;
}

type ListUsersParams = {
  searchValue?: string;
  searchField?: 'email' | 'name';
  searchOperator?: 'contains' | 'starts_with' | 'ends_with';
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filterField?: string;
  filterValue?: string | number | boolean;
  filterOperator?: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';
}

type CreateUserInput = {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

type UpdateUserInput = {
  userId: string;
  data: Partial<Pick<User, 'name' | 'email' | 'image'>>;
}

type BanUserInput = {
  userId: string;
  banReason?: string;
  banExpiresIn?: number;
}

type SetRoleInput = {
  userId: string;
  role: UserRole;
}

type SetPasswordInput = {
  userId: string;
  newPassword: string;
}

export type {
  BanUserInput,
  CreateUserInput,
  ListUsersParams,
  ListUsersResponse,
  SetPasswordInput,
  SetRoleInput,
  UpdateUserInput,
  User,
  UserRole,
}

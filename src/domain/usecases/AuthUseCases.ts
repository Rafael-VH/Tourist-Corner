import type { AuthRepository } from '@/domain/repositories/AuthRepository';
import type { User, UserRole } from '@/domain/entities/User';

export class SignInUseCase {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(email: string, password: string): Promise<User> {
    return this.authRepository.signIn(email, password);
  }
}

export class SignUpUseCase {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(email: string, password: string, name: string, role: UserRole, registrationCode?: string): Promise<User> {
    return this.authRepository.signUp(email, password, name, role, registrationCode);
  }
}

export class SignOutUseCase {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<void> {
    return this.authRepository.signOut();
  }
}

export class GetCurrentUserUseCase {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<User | null> {
    return this.authRepository.getCurrentUser();
  }
}

export class UpdateProfileUseCase {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(userId: string, data: Partial<User>): Promise<User> {
    return this.authRepository.updateProfile(userId, data);
  }
}

export class UploadAvatarUseCase {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(userId: string, file: File): Promise<string> {
    return this.authRepository.uploadAvatar(userId, file);
  }
}

export class UpdatePasswordUseCase {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(currentPassword: string, newPassword: string): Promise<void> {
    return this.authRepository.updatePassword(currentPassword, newPassword);
  }
}

export class ResetPasswordUseCase {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(email: string): Promise<void> {
    return this.authRepository.resetPasswordEmail(email);
  }
}

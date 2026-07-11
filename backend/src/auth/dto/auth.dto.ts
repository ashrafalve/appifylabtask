import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

/**
 * Registration body. firstName/lastName required; email unique; password
 * must be at least 8 chars and contain letters + numbers (configurable policy).
 */
export class RegisterDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  password: string;
}

/**
 * Login body. Credentials are validated against the hashed store in the service.
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}

import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Matches(
    /^(\+234|234|0)?[789][01]\d{8}$/,
    { message: 'Please provide a valid Nigerian phone number' }
  )
  phoneNumber: string;

  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  otp: string;
}

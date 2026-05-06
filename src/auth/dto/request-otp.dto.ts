import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Matches(
    /^(\+234|234|0)?[789][01]\d{8}$/,
    { message: 'Please provide a valid Nigerian phone number' }
  )
  phoneNumber: string;
}

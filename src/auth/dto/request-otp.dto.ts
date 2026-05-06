import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+234|234|0)[0-9]{10}$/, {
    message: 'Phone number must be a valid Nigerian phone number',
  })
  phoneNumber: string;
}

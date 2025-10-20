import { Module, Global } from '@nestjs/common';
import { JOSMSService } from './josms.service';
import { JOSMSResolver } from './josms.resolver';
import { AwsS3Service } from './aws-s3.service';

@Global()
@Module({
  providers: [JOSMSService, JOSMSResolver, AwsS3Service],
  exports: [JOSMSService, AwsS3Service],
})
export class ServicesModule {}

import { Global, Module } from '@nestjs/common';
import { SingleUserService } from './single-user.service';

@Global()
@Module({
  providers: [SingleUserService],
  exports: [SingleUserService],
})
export class CommonModule {}

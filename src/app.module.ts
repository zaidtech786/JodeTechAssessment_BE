import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
MongooseModule.forRoot(process.env.MONGO_URI! ),
    UserModule 
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit  { 

  constructor(@InjectConnection() private readonly connection: Connection) {}
  onModuleInit() {
    console.log('onModuleInit called');
    console.log('Connection state:', this.connection.readyState);
  }
}

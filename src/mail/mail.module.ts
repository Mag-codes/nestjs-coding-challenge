import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST', 'localhost'),
          port: config.get('MAIL_PORT', 1025),
          secure: false,
          auth:
            config.get('MAIL_USER') && config.get('MAIL_PASSWORD')
              ? {
                  user: config.get('MAIL_USER'),
                  pass: config.get('MAIL_PASSWORD'),
                }
              : undefined,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

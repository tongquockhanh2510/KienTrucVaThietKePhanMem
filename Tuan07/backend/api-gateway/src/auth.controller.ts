import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { IntrospectCommand, LoginCommand, RegisterCommand } from './cqrs/auth.commands';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.commandBus.execute(new LoginCommand(body.username, body.password));
  }

  @Post('register')
  register(@Body() body: { username: string; email: string; password: string }) {
    return this.commandBus.execute(new RegisterCommand(body.username, body.email, body.password));
  }

  @Post('introspect')
  introspect(@Body() body: { token: string }) {
    return this.commandBus.execute(new IntrospectCommand(body.token));
  }
}

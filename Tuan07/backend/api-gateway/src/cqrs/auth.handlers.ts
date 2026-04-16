import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { config } from '../config';
import { GatewayHttpService } from '../shared/gateway-http.service';
import { IntrospectCommand, LoginCommand, RegisterCommand } from './auth.commands';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(private readonly http: GatewayHttpService) {}

  execute(command: LoginCommand) {
    return this.http.request(config.authServiceUrl, 'POST', '/auth/login', {
      body: { username: command.username, password: command.password },
    });
  }
}

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(private readonly http: GatewayHttpService) {}

  execute(command: RegisterCommand) {
    return this.http.request(config.authServiceUrl, 'POST', '/auth/register', {
      body: {
        username: command.username,
        email: command.email,
        password: command.password,
      },
    });
  }
}

@CommandHandler(IntrospectCommand)
export class IntrospectHandler implements ICommandHandler<IntrospectCommand> {
  constructor(private readonly http: GatewayHttpService) {}

  execute(command: IntrospectCommand) {
    return this.http.request(config.authServiceUrl, 'POST', '/auth/introspect', {
      body: { token: command.token },
    });
  }
}

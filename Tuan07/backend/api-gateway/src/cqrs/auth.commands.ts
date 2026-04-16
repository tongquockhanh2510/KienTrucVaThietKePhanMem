export class LoginCommand {
  constructor(
    public readonly username: string,
    public readonly password: string
  ) {}
}

export class RegisterCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string
  ) {}
}

export class IntrospectCommand {
  constructor(public readonly token: string) {}
}

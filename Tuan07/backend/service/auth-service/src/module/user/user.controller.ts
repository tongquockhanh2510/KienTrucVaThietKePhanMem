import { Controller, Get, NotFoundException, Param, ParseIntPipe } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

    @Get()
    async getUsers() {
        return this.userService.findAllPublic();
    }

    @Get(':id')
    async getUserById(@Param('id', ParseIntPipe) id: number) {
        const user = await this.userService.findPublicById(id);
        if (!user) {
            throw new NotFoundException(`User ${id} not found`);
        }
        return user;
    }
}
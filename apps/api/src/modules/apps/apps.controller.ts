import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Patch,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AppsService } from "./apps.service";
import { UpdateAppDto } from "./dto/update-app.dto";

@Controller("apps")
@UseGuards(AuthGuard("jwt"))
export class AppsController {
  constructor(private apps: AppsService) {}

  @Get()
  async list() {
    return this.apps.list();
  }

  @Post()
  async create(@Body() body: { slug: string; name: string }) {
    return this.apps.create(body);
  }

  @Post(":id/keys")
  async createKey(@Param("id") id: string) {
    return this.apps.createIngestionKey(id);
  }

  @Delete("keys/:keyId")
  async revokeKey(@Param("keyId") keyId: string) {
    return this.apps.revokeKey(keyId);
  }
  @Patch("/:id")
  async update(@Param("id") id: string, @Body() body: UpdateAppDto) {
    return this.apps.update(id, body);
  }
}

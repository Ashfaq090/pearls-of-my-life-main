import { Global, Module } from "@nestjs/common";
import { JwtHelper } from "./jwt-helper";

@Global()
@Module({
    providers: [JwtHelper],
    exports: [JwtHelper]
})
export class HelperModule {}
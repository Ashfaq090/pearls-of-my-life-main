import { AuthGuard as JwtAuthGuard } from "@nestjs/passport"; 

export class AuthGraud extends JwtAuthGuard('jwt') {}
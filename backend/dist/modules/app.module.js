"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_module_1 = require("../shared/config/config.module");
const payments_module_1 = require("./payments/payments.module");
const peers_module_1 = require("./peers/peers.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => {
                    console.log(process.env.DATABASE_URL);
                    return {
                        type: 'postgres',
                        url: process.env.DATABASE_URL,
                        autoLoadEntities: true,
                        synchronize: true,
                    };
                },
            }),
            users_module_1.UsersModule,
            payments_module_1.PaymentsModule,
            peers_module_1.PeersModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
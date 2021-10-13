import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({})
@Global() //so we dont have to import every time
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    //forRoot returns DynamicModule
    //DynamicModule returns another module
    return {
      module: JwtModule, //module export service >>>so we should be able to use it on /users.module
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}

import { Injectable } from '@nestjs/common';
import {
  ServeStaticModuleOptions,
  ServeStaticModuleOptionsFactory,
} from '@nestjs/serve-static';
import { join } from 'path';

@Injectable()
export class StaticAssetsService implements ServeStaticModuleOptionsFactory {
  // implement the exact method name Nest is expecting
  createLoggerOptions(): ServeStaticModuleOptions[] {
    const base =
      process.env.NODE_ENV === 'production'
        ? join(process.cwd(), 'dist', 'app', 'public-pages', 'static')
        : join(process.cwd(), 'src', 'app', 'public-pages', 'static');

    const notFound =
      process.env.NODE_ENV === 'production'
        ? join(process.cwd(), 'dist', 'app', 'not-found', 'static')
        : join(process.cwd(), 'src', 'app', 'not-found', 'static');

    return [
      {
        rootPath: base,
        serveRoot: '/',
        exclude: ['/api*'],
        serveStaticOptions: {
          extensions: ['html', 'css'],
          index: false,
        },
      },
      {
        rootPath: notFound,
        serveRoot: '/',
        exclude: ['/api*'],
        serveStaticOptions: {
          extensions: ['html', 'css'],
          index: false,
        },
      },
    ];
  }
}
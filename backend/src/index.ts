import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { graphqlHandler } from './interfaces/http/graphql/server';
import { onError } from './middlewares/error-handler';
import { requestIdMiddleware } from './middlewares/request-id';
import { requestLoggerMiddleware } from './middlewares/request-logger';

// 创建一个Hono应用实例
const app = new Hono();

// 错误处理（全局）
app.onError(onError);

// 统一CORS中间件
app.use('*', cors());

// 追踪ID与结构化日志（每个请求）
app.use('*', requestIdMiddleware);
app.use('*', requestLoggerMiddleware);

// 注册路由
app.all('/graphql', graphqlHandler);

// 错误处理

export default app;

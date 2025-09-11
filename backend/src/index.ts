import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRoutes } from './routes/health';

// 创建一个Hono应用实例
const app = new Hono();

// 注册中间件
app.use('*', logger());

// 统一CORS中间件
app.use('*', cors());

// 注册路由
app.route('/api/health', healthRoutes);

// 错误处理

export default app;

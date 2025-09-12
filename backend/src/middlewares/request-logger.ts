import type { MiddlewareHandler } from 'hono';
import { createLogger } from '../utils/logger';

declare module 'hono' {
	interface ContextVariableMap {
		logger: ReturnType<typeof createLogger>;
	}
}

export const requestLoggerMiddleware: MiddlewareHandler = async (c, next) => {
	const requestId = c.get('requestId');
	const base = createLogger({ level: 'info', fields: { requestId } });
	const logger = base.child({ path: c.req.path, method: c.req.method });
	c.set('logger', logger);

	const start = Date.now();
	logger.info('request.start');
	try {
		await next();
	} finally {
		const duration = Date.now() - start;
		const status = c.res.status;
		logger.info('request.end', { status, duration });
	}
};

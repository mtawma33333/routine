import type { Context } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';
import { serializeError } from '../utils/logger';

export class HttpError extends Error {
	status: number;
	code?: string;
	constructor(message: string, status = 400, code?: string) {
		super(message);
		this.name = 'HttpError';
		this.status = status;
		this.code = code;
	}
}

export function onError(err: unknown, c: Context) {
	const logger = c.get('logger');
	const requestId = c.get('requestId');
	const isHttp = err instanceof HttpError;
	const status = isHttp ? err.status : 500;
	const code = isHttp ? (err.code ?? 'BAD_REQUEST') : 'INTERNAL_ERROR';

	logger?.error('request.error', { status, code, error: serializeError(err) });

	const body = {
		error: {
			message: isHttp ? err.message : 'Internal Server Error',
			code,
			requestId
		}
	};
	c.status(status as StatusCode);
	return c.json(body);
}

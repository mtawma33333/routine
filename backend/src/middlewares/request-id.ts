import type { Context, MiddlewareHandler } from 'hono';

export const REQUEST_ID_HEADER = 'x-request-id';

declare module 'hono' {
	interface ContextVariableMap {
		requestId: string;
	}
}

function getRequestId(c: Context): string {
	const fromHeader = c.req.header(REQUEST_ID_HEADER);
	if (fromHeader && fromHeader.trim().length > 0) return fromHeader.trim();
	// Workers runtime exposes crypto.randomUUID
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return crypto.randomUUID();
}

export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
	const id = getRequestId(c);
	c.set('requestId', id);
	await next();
	// Ensure response carries the request id for client-side correlation
	c.res.headers.set(REQUEST_ID_HEADER, id);
};

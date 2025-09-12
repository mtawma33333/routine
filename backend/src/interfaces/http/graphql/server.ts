import { createYoga } from 'graphql-yoga';
import type { Handler } from 'hono';
import { schema } from './schema';

export const graphqlHandler: Handler = (c) => {
	const yoga = createYoga({
		schema,
		graphqlEndpoint: '/graphql',
		graphiql: true,
		context: async () => ({
			requestId: c.get('requestId'),
			logger: c.get('logger'),
			env: c.env as Env
		})
	});
	return yoga.fetch(c.req.raw);
};

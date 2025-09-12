import { createSchema } from 'graphql-yoga';
import type { Logger } from '../../../utils/logger';

export interface GraphQLContext {
	requestId: string;
	logger: Logger;
	env: Env;
}

export const schema = createSchema<GraphQLContext>({
	typeDefs: /* GraphQL */ `
		type Health {
			ok: Boolean!
			name: String!
			version: String!
			time: String!
		}

		type Query {
			health: Health!
		}
	`,
	resolvers: {
		Query: {
			health: (_parent, _args, ctx) => {
				ctx.logger.info('graphql.health');
				// Version could be injected via Env later; use a stable default now.
				const version = 'dev';
				return {
					ok: true,
					name: 'backend',
					version,
					time: new Date().toISOString()
				};
			}
		}
	}
});

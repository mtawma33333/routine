// Simple GraphQL fetch wrapper; replace with codegen later
interface GraphQLErrorShape {
	message: string;
	path?: (string | number)[];
	extensions?: Record<string, unknown>;
}

export async function gql<
	TData = unknown,
	TVars extends Record<string, unknown> = Record<string, unknown>
>(query: string, variables?: TVars, opts: RequestInit = {}): Promise<TData> {
	const endpoint = import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql';
	const res = await fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query, variables }),
		...opts
	});
	if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
	const json = await res.json();
	if (json.errors) {
		const errs = (json.errors as GraphQLErrorShape[]).map((e) => e.message).join('; ');
		throw new Error(errs);
	}
	return json.data;
}

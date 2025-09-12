export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
	level: LogLevel;
	fields?: Record<string, unknown>;
	debug: (message: string, fields?: Record<string, unknown>) => void;
	info: (message: string, fields?: Record<string, unknown>) => void;
	warn: (message: string, fields?: Record<string, unknown>) => void;
	error: (message: string, fields?: Record<string, unknown>) => void;
	child: (fields: Record<string, unknown>) => Logger;
}

const levelOrder: Record<LogLevel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40
};

function logToConsole(level: LogLevel, payload: Record<string, unknown>) {
	const line = JSON.stringify(payload);
	switch (level) {
		case 'debug':
			console.debug(line);
			break;
		case 'info':
			console.info(line);
			break;
		case 'warn':
			console.warn(line);
			break;
		case 'error':
			console.error(line);
			break;
	}
}

export function createLogger(opts?: {
	level?: LogLevel;
	fields?: Record<string, unknown>;
}): Logger {
	const currentLevel: LogLevel = opts?.level ?? 'info';
	const baseFields = opts?.fields ?? {};

	const log = (level: LogLevel, message: string, fields?: Record<string, unknown>) => {
		if (levelOrder[level] < levelOrder[currentLevel]) return;
		const ts = new Date().toISOString();
		const payload = { level, msg: message, ts, ...baseFields, ...(fields ?? {}) };
		logToConsole(level, payload);
	};

	return {
		level: currentLevel,
		fields: baseFields,
		debug: (m, f) => log('debug', m, f),
		info: (m, f) => log('info', m, f),
		warn: (m, f) => log('warn', m, f),
		error: (m, f) => log('error', m, f),
		child(fields: Record<string, unknown>) {
			return createLogger({ level: currentLevel, fields: { ...baseFields, ...fields } });
		}
	};
}

// Helpers to serialize Error safely
export function serializeError(err: unknown) {
	if (err instanceof Error) {
		return {
			name: err.name,
			message: err.message,
			stack: err.stack
		};
	}
	try {
		return typeof err === 'object' ? err : { message: String(err) };
	} catch {
		return { message: 'Unknown error' };
	}
}

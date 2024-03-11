import { GameStateParams, Templates } from './types.js'

export const createCounts = <T extends Templates>(
	params: Omit<GameStateParams<T>, 'player'>,
) => {
	const collisionCount = new Map<keyof T, number>()
	const enterCount = new Map<keyof T, number>()
	const leaveCount = new Map<keyof T, number>()
	const _reset = () => {
		for (const key in params.templates) {
			collisionCount.set(key, 0)
			enterCount.set(key, 0)
			leaveCount.set(key, 0)
		}
	}
	_reset()

	return {
		getCollision: (symbol: keyof T) => collisionCount.get(symbol) ?? 0,
		getEnter: (symbol: keyof T) => enterCount.get(symbol) ?? 0,
		getLeave: (symbol: keyof T) => leaveCount.get(symbol) ?? 0,
		_incrCollision: (symbol: keyof T) =>
			collisionCount.set(symbol, (collisionCount.get(symbol) ?? 0) + 1),
		_incrEnter: (symbol: keyof T) =>
			enterCount.set(symbol, (enterCount.get(symbol) ?? 0) + 1),
		_incrLeave: (symbol: keyof T) =>
			leaveCount.set(symbol, (leaveCount.get(symbol) ?? 0) + 1),
		_reset,
	}
}

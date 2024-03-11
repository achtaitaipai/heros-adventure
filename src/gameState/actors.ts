import { compareVectors, createGridFromString } from '../lib/index.js'
import { createStore } from '../lib/store.js'
import {
	ActorState,
	TemplateEventsListeners as TemplatesEventsListeners,
	Position,
} from '../types.js'
import { GameStateParams, Template, Templates } from './types.js'

export const createActorsStore = <T extends Templates>(
	params: Omit<GameStateParams<T>, 'player'>,
) => {
	const { map } = params
	const templates = params.templates
	const mapGrid = createGridFromString(map)
	const eventsListeners = new Map<
		string | number | symbol,
		TemplatesEventsListeners
	>()
	for (const key in templates) {
		const template = templates[key]
		if (!template) continue
		eventsListeners.set(key, {
			onCollide: template.onCollide,
			onEnter: template.onEnter,
			onLeave: template.onLeave,
		})
	}

	let actorsValues = createActors(mapGrid, templates)
	const store = createStore(actorsValues)
	store.subscribe((value) => {
		actorsValues = value
	})
	const setAll = (symbol: keyof T, params: Partial<ActorState>) => {
		store.update((actors) => {
			for (let index = 0; index < actors.length; index++) {
				const actor = actors[index]
				if (actor?.symbol !== symbol) continue
				const newValue = Object.assign({}, actor, params)
				actors[index] = newValue
			}
			return actors
		})
	}
	const setCell = (x: number, y: number, params: Partial<ActorState>) => {
		store.update((currentActors) => {
			for (let index = 0; index < currentActors.length; index++) {
				const actor = currentActors[index]
				if (
					!actor ||
					!actor.position ||
					!compareVectors(actor.position, [x, y])
				)
					continue
				const newValue = Object.assign({}, actor, params)
				currentActors[index] = newValue
			}
			return currentActors
		})
	}
	const addToCell = (x: number, y: number, symbol: keyof T) => {
		const template = templates[symbol]
		if (template)
			store.update((actors) => {
				return [...actors, createActorFromTemplate(x, y, symbol, template)]
			})
	}
	const clearCell = (x: number, y: number) => {
		store.update((actors) => {
			return [...actors].filter(
				({ position }) => position[0] !== x || position[1] !== y,
			)
		})
	}
	const getCell = (...position: Position): ActorState => {
		const getActor = () =>
			actorsValues.find((el) => compareVectors(el.position, position))
		const setActor = <T extends keyof ActorState>(
			key: T,
			value: ActorState[T],
		) => {
			store.update((currentStore) => {
				for (let index = 0; index < currentStore.length; index++) {
					const actor = currentStore[index]
					if (
						!actor ||
						currentStore[index] === undefined ||
						!compareVectors(actor.position, position)
					)
						continue
					currentStore[index]![key] = value
				}
				return currentStore
			})
		}
		return {
			get sprite() {
				return getActor()?.sprite ?? null
			},
			set sprite(value: ActorState['sprite']) {
				setActor('sprite', value)
			},
			get solid() {
				return getActor()?.solid ?? false
			},
			set solid(value: ActorState['solid']) {
				setActor('solid', value)
			},
			get sound() {
				return getActor()?.sound ?? null
			},
			set sound(value: ActorState['sound']) {
				setActor('sound', value)
			},
			get position() {
				return getActor()?.position ?? [-1, -1]
			},
			get dialog() {
				return getActor()?.dialog ?? null
			},
			set dialog(value: ActorState['dialog']) {
				setActor('dialog', value)
			},
			get visible() {
				return getActor()?.visible ?? false
			},
			set visible(value: ActorState['visible']) {
				setActor('visible', value)
			},
			get end() {
				return getActor()?.end ?? null
			},
			set end(value: ActorState['end']) {
				setActor('end', value)
			},
			get symbol() {
				return getActor()?.symbol ?? ''
			},
		}
	}
	const reset = () => store.set(createActors(mapGrid, templates))
	return {
		getCell,
		setCell,
		setAll,
		addToCell,
		clearCell,
		reset,
		_store: store,
		_eventsListeners: eventsListeners,
	}
}

const createActors = (mapGrid: string[], templates: Templates) => {
	const actors: ActorState[] = []
	for (let y = 0; y < mapGrid.length; y++) {
		const row = mapGrid[y]
		if (!row) continue
		for (let x = 0; x < row.length; x++) {
			const actorSymbol = row[x]
			if (!actorSymbol) continue
			const template = templates[actorSymbol]
			if (!template) continue
			actors.push(createActorFromTemplate(x, y, actorSymbol, template))
		}
	}
	return actors
}

export const createActorFromTemplate = <T extends Templates>(
	x: number,
	y: number,
	symbol: keyof T,
	template: Template,
): ActorState => {
	return {
		symbol: symbol,
		sprite: template.sprite ?? null,
		position: [x, y],
		dialog: template.dialog ?? null,
		end: template.end ?? null,
		sound: template.sound ?? null,
		solid: template.solid !== false,
		visible: template.visible !== false,
	}
}

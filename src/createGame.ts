import { initCamera } from './camera.js'
import { Config, defaultConfig } from './config.js'
import { initDialog } from './dialog.js'
import { initGameLoop } from './gameLoop.js'
import { initGameState } from './gameState/index.js'
import { Templates } from './gameState/types.js'
import { initInputsHandler } from './inputs.js'
import { initMessageBox } from './messageBox.js'
import { initRenderer } from './renderer.js'
import { initSoundPlayer } from './soundPlayer.js'
import { initWrapper } from './wrapperElement.js'

export const createGame = <T extends Templates>(
	userConfig: Partial<Config<T>>,
) => {
	const config: Config<T> & typeof defaultConfig = Object.assign(
		{},
		defaultConfig,
		userConfig,
	)
	const gameState = initGameState(config)
	const soundPlayer = initSoundPlayer(config)
	const wrapper = initWrapper(config)
	const camera = initCamera(config, gameState.mapDimensions)
	const renderer = initRenderer(config, wrapper)
	const dialog = initDialog(wrapper)
	const messageBox = initMessageBox(wrapper)

	const gameLoop = initGameLoop({
		gameState: gameState,
		soundPlayer: soundPlayer,
		dialog,
		messageBox,
		camera,
	})

	initInputsHandler(config, wrapper, (input) => {
		if (messageBox.isOpen) {
			if (input === 'ACTION') messageBox.close()
		} else if (dialog.isOpen) {
			if (input === 'ACTION') dialog.next()
		} else if (input !== 'ACTION') gameLoop.update(input)
	})

	gameState.actors._store.subscribe((actors) => {
		camera.update(gameState.player.playerProxy.position)
		renderer.render([...actors, gameState.player.playerProxy], camera.position)
	})

	gameState.player.playerStore.subscribe((player) => {
		camera.update(gameState.player.playerProxy.position)
		renderer.render([...gameState.actors._store.get(), player], camera.position)
	})

	if (config.title) messageBox.open(config.title)

	const gameApi = {
		player: gameState.player.playerProxy,
		getCell: gameState.actors.getCell,
		addToCell: gameState.actors.addToCell,
		setCell: gameState.actors.setCell,
		setAll: gameState.actors.setAll,
		getCollisionCount: gameState.counts.getCollision,
		getEnterCount: gameState.counts.getEnter,
		getLeaveCount: gameState.counts.getLeave,
		openDialog: (text: string) => dialog.open(text),
		playSound: (sound: string) => soundPlayer.play(sound),
		reset: () => {
			gameState.player.reset()
			gameState.actors.reset()
			gameState.counts._reset()
		},
	}
	return gameApi
}

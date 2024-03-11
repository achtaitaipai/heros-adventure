import { initCamera } from './camera.js'
import { Config, defaultConfig } from './config.js'
import { initDialog } from './dialog.js'
import { initSoundPlayer } from './soundPlayer.js'
import { initGameLoop } from './gameLoop.js'
import { GameState } from './gameState/index.js'
import { initInputsHandler } from './inputs.js'
import { initMessageBox } from './messageBox.js'
import { initRenderer } from './renderer.js'
import { initWrapper } from './wrapperElement.js'

export const startGame = (
	userConfig: Partial<Config> & { game: GameState },
) => {
	const config = Object.assign({}, defaultConfig, userConfig)
	const soundPlayer = initSoundPlayer(config)
	const wrapper = initWrapper(config)
	const camera = initCamera(config, config.game.mapDimensions)
	const renderer = initRenderer(config, wrapper)
	const dialog = initDialog(wrapper)
	const messageBox = initMessageBox(wrapper)

	const gameLoop = initGameLoop({
		gameState: config.game,
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

	config.game.actors._store.subscribe((actors) => {
		camera.update(config.game.player.position)
		renderer.render([...actors, config.game.player], camera.position)
	})

	config.game.player.store.subscribe((player) => {
		camera.update(config.game.player.position)
		renderer.render(
			[...config.game.actors._store.get(), player],
			camera.position,
		)
	})

	if (config.title) messageBox.open(config.title)
}

// Restart
//reset actors
//reset player
//reset camera
// setup function

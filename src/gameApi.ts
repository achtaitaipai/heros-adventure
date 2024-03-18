import { Dialog } from './dialog.js'
import { GameState } from './gameState/index.js'
import { Templates } from './gameState/types.js'
import { SoundPlayer } from './soundPlayer.js'

export const initGameApi = <T extends Templates>(
	gameState: GameState<T>,
	dialog: Dialog,
	soundPlayer: SoundPlayer,
) => {
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

import { Dialog } from './dialog.js'
import { SoundPlayer } from './soundPlayer.js'
import { GameState } from './gameState/index.js'
import { Input } from './inputs.js'
import { addVectors, compareVectors } from './lib/vector.js'
import { MessageBox } from './messageBox.js'
import { ActorState, GameEvent, Position } from './types.js'
import { Camera } from './camera.js'

export type GameLoopParams = {
	soundPlayer: SoundPlayer
	dialog: Dialog
	gameState: GameState
	messageBox: MessageBox
	camera: Camera
}

class GameLoop {
	gameState: GameState
	soundPlayer: SoundPlayer
	dialog: Dialog
	event: (target: ActorState) => GameEvent
	messageBox: MessageBox
	camera: Camera

	constructor(params: GameLoopParams) {
		this.gameState = params.gameState
		this.soundPlayer = params.soundPlayer
		this.dialog = params.dialog
		this.messageBox = params.messageBox
		this.camera = params.camera
		this.event = (target) => ({
			target,
			playSound: (sound) => this.soundPlayer.play(sound),
			openDialog: (text) => this.dialog.open(text),
			openMessage: (text) => this.messageBox.open(text),
		})
	}

	async update(input: Input) {
		const currentCell = this.gameState.player.position
		const nextCell = addVectors(currentCell, directions[input])
		if (!this.isCellOnScreen(nextCell)) return
		const actorOnCurrentCell = this.gameState.actors.getCell(...currentCell)
		const actorOnNextCell = this.gameState.actors.getCell(...nextCell)
		const sound = actorOnNextCell.sound
		if (sound) this.soundPlayer.play(sound)

		const end = actorOnNextCell.end

		if (actorOnNextCell.solid) {
			const colliderDialog = actorOnNextCell.dialog
			if (colliderDialog) await this.dialog.open(colliderDialog)

			await this.gameState.actors._eventsListeners
				.get(actorOnNextCell.symbol ?? '')
				?.onCollide?.(this.event(actorOnNextCell))
			this.gameState.counts._incrCollision(actorOnNextCell.symbol)
		} else {
			if (actorOnCurrentCell) {
				this.gameState.actors._eventsListeners
					.get(actorOnNextCell.symbol ?? '')
					?.onLeave?.(this.event(actorOnCurrentCell))
				this.gameState.counts._incrLeave(actorOnCurrentCell.symbol)
			}
			if (actorOnNextCell) {
				const enterDialog = actorOnNextCell?.dialog
				if (enterDialog)
					this.dialog.open(enterDialog).then(() => {
						this.gameState.actors._eventsListeners
							.get(actorOnNextCell.symbol ?? '')
							?.onEnter?.(this.event(actorOnNextCell))
					})
				else {
					this.gameState.actors._eventsListeners
						.get(actorOnNextCell.symbol ?? '')
						?.onEnter?.(this.event(actorOnNextCell))
				}
				this.gameState.counts._incrEnter(actorOnNextCell.symbol)
			}
			//move the player if the position is not changed
			if (compareVectors(currentCell, this.gameState.player.position))
				this.gameState.player.position = nextCell
		}
		if (end) {
			await this.messageBox.open(end)
			this.reset()
			console.log('fin')
		}
	}

	reset() {
		this.camera.reset()
		this.gameState.player.reset()
		this.gameState.actors.reset()
		this.gameState.counts._reset()
	}

	isCellOnScreen([x, y]: Position) {
		return (
			x >= 0 &&
			y >= 0 &&
			x < this.gameState.mapDimensions[0] &&
			y < this.gameState.mapDimensions[1]
		)
	}

	getActorOnCell(actors: ActorState[], cellPosition: Position) {
		return actors.find(
			({ position }) =>
				position[0] === cellPosition[0] && position[1] === cellPosition[1],
		)
	}
}

const directions: Record<Input, Position> = {
	LEFT: [-1, 0],
	RIGHT: [1, 0],
	UP: [0, -1],
	DOWN: [0, 1],
	ACTION: [0, 0],
}

export const initGameLoop = (params: GameLoopParams) => new GameLoop(params)

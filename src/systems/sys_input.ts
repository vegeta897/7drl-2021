import { System } from 'ape-ecs'
import {
	ControllerState,
	Directions,
	GlobalEntity,
	SystemGroup,
} from '../types'
import Controller from '../components/com_controller'

// Based on https://github.com/fritzy/7drl2020
export default class InputSystem extends System {
	keys = new Set()
	currentKey: typeof gameKeys[number] | null
	init() {
		window.addEventListener('keydown', this.keyDown.bind(this))
		window.addEventListener('keyup', this.keyUp.bind(this))
	}
	update() {
		let direction: Directions | null = null
		let wait = false
		let restart = false
		switch (this.currentKey) {
			case 'KeyW':
			case 'KeyK':
			case 'ArrowUp':
				// Up
				direction = Directions.Up
				break
			case 'KeyS':
			case 'KeyJ':
			case 'ArrowDown':
				// Down
				direction = Directions.Down
				break
			case 'KeyA':
			case 'KeyH':
			case 'ArrowLeft':
				// Left
				direction = Directions.Left
				break
			case 'KeyD':
			case 'KeyL':
			case 'ArrowRight':
				// Right
				direction = Directions.Right
				break
			case 'Space':
				// Wait
				wait = true
				break
			case 'Enter':
				restart = true
		}
		if (direction !== null || wait || restart) {
			const controller = <Controller>(
				this.world.getEntity(GlobalEntity.Game)!.c.controller
			)
			controller.direction = direction
			controller.wait = wait
			controller.continue = restart
			controller.sneak =
				this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')
			controller.boost =
				this.keys.has('ControlLeft') || this.keys.has('ControlRight')
		}
	}
	keyDown(e) {
		if (!e.repeat) {
			if (gameKeys.includes(e.code)) e.preventDefault()
			this.keys.add(e.code)
			if (
				this.world.getEntity(GlobalEntity.Game)!.c.controller.state ===
				ControllerState.Ready
			) {
				this.currentKey = e.code
				this.world.runSystems(SystemGroup.Input)
			}
		}
	}

	keyUp(e) {
		this.keys.delete(e.code)
		this.currentKey = null
		if (gameKeys.includes(e.code)) e.preventDefault()
	}
}

// Events for these keys are consumed by the game
const gameKeys = [
	'KeyW',
	'KeyA',
	'KeyS',
	'KeyD',
	'KeyK',
	'KeyJ',
	'KeyH',
	'KeyL',
	'ArrowUp',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ShiftLeft',
	'ShiftRight',
	'ControlLeft',
	'ControlRight',
	'Space',
	'Enter',
]

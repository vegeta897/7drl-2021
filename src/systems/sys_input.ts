import { System } from 'ape-ecs'
import { Directions, GlobalEntity, SystemGroup } from '../types'
import Controller from '../components/com_controller'

// Based on https://github.com/fritzy/7drl2020
export default class InputSystem extends System {
	keys = new Set()
	currentKey: string | null
	init() {
		window.addEventListener('keydown', this.keyDown.bind(this))
		window.addEventListener('keyup', this.keyUp.bind(this))
	}
	update() {
		let direction: Directions | null = null
		switch (this.currentKey) {
			case 'KeyW':
			case 'KeyK':
			case 'ArrowUp':
			case 'Numpad8':
				// Up
				direction = Directions.Up
				break
			case 'KeyS':
			case 'KeyJ':
			case 'ArrowDown':
			case 'Numpad2':
				// Down
				direction = Directions.Down
				break
			case 'KeyA':
			case 'KeyH':
			case 'ArrowLeft':
			case 'Numpad4':
				// Left
				direction = Directions.Left
				break
			case 'KeyD':
			case 'KeyL':
			case 'ArrowRight':
			case 'Numpad6':
				// Right
				direction = Directions.Right
				break
		}
		if (direction !== null) {
			const controller = <Controller>(
				this.world.getEntity(GlobalEntity.Game)!.c.controller
			)
			controller.direction = direction
			controller.boost =
				this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')
		}
	}
	keyDown(e) {
		if (!e.repeat) {
			this.keys.add(e.code)
			this.currentKey = e.code
			this.world.runSystems(SystemGroup.Input)
		}
	}

	keyUp(e) {
		this.keys.delete(e.code)
		this.currentKey = null
	}
}

import { Component } from 'ape-ecs'
import { Emitter } from 'pixi-particles'
import { GlobalEntity } from '../types'

export default class Particles extends Component {
	static typeName = 'Particles'
	emitter: Emitter
	static properties = {
		emitter: null,
	}
	preDestroy() {
		if (this.world.getEntity(GlobalEntity.Game)!.c.game.win) {
			this.emitter.destroy()
		} else {
			// Destroy emitter after waiting for all particles to die
			setTimeout(() => this.emitter.destroy(), this.emitter.maxLifetime * 1000)
		}
	}
}

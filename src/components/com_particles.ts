import { Component } from 'ape-ecs'
import { Emitter } from 'pixi-particles'

export default class Particles extends Component {
	static typeName = 'Particles'
	emitter: Emitter
	static properties = {
		emitter: null,
	}
	preDestroy() {
		// Destroy emitter after waiting for all particles to die
		setTimeout(() => this.emitter.destroy(), this.emitter.maxLifetime * 1000)
	}
}

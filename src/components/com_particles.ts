import { Component } from 'ape-ecs'
import { Emitter } from 'pixi-particles'

export default class Particles extends Component {
	static typeName = 'Particles'
	emitter: Emitter
	static properties = {
		emitter: null,
	}
	preDestroy() {
		this.emitter.destroy()
	}
}

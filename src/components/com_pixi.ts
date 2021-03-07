import { Component } from 'ape-ecs'
import { Container } from 'pixi.js'

export class PixiObject extends Component {
	static typeName = 'PixiObject'
	object: Container
	static properties = {
		object: null,
	}
	preDestroy() {
		// Destroy the PIXI object when this component is destroyed
		this.object.destroy()
	}
}

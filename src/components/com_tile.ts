import { Component } from 'ape-ecs'
import { Sprite } from 'pixi.js'

export class Tile extends Component {
	static typeName = 'Tile'
	sprite!: Sprite
	x!: number
	y!: number
	static properties = {
		sprite: null,
		x: 0,
		y: 0,
	}
	preDestroy() {
		// Destroy the PIXI object when this component is destroyed
		this.sprite.destroy()
	}
}

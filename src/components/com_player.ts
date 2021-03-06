import { Component } from 'ape-ecs'

export class Player extends Component {
	static typeName = 'Player'
	health: number
	static properties = {
		health: 10,
	}
}

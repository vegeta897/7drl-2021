import { Component } from 'ape-ecs'

export default class Player extends Component {
	static typeName = 'Player'
	health: number
	static properties = {
		health: 10,
	}
}

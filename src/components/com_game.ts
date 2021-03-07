import { Component } from 'ape-ecs'

export default class Game extends Component {
	static typeName = 'Game'
	inputLocked: boolean
	autoUpdate: number | null
	timeout: number | null
	static properties = {
		inputLocked: false,
		autoUpdate: null,
		timeout: null,
	}
}

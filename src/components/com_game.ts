import { Component } from 'ape-ecs'
import { Level } from '../level'

export default class Game extends Component {
	static typeName = 'Game'
	level: Level
	wait: boolean
	autoUpdate: boolean
	static properties = {
		level: null,
		wait: false,
		autoUpdate: false,
	}
}

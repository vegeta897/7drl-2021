import { Component } from 'ape-ecs'
import { Level } from '../level'

export default class LevelData extends Component {
	static typeName = 'LevelData'
	level: Level
	static properties = {
		level: null,
	}
}

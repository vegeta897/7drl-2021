import { Component } from 'ape-ecs'
import { Tile } from './com_tile'

export default class Follow extends Component {
	static typeName = 'Follow'
	target: Tile | null
	static properties = {
		target: null,
	}
}

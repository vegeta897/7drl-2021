import { Component } from 'ape-ecs'
import { Directions } from '../types'

export class Grinding extends Component {
	static typeName = 'Grinding'
	from: Directions
	static properties = {
		from: null,
	}
}

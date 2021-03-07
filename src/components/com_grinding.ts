import { Component } from 'ape-ecs'
import { Directions } from '../types'

export default class Grinding extends Component {
	static typeName = 'Grinding'
	direction: Directions
	static properties = {
		direction: null,
	}
}

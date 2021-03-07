import { Component } from 'ape-ecs'
import { Directions } from '../types'
import { Tween } from '@tweenjs/tween.js'

export class Move extends Component {
	static typeName = 'Move'
	x: number
	y: number
	direction: Directions
	tween: Tween<{ x: number; y: number }> | null
	static properties = {
		x: 0,
		y: 0,
		direction: null,
	}
}

import { Component } from 'ape-ecs'

export default class Transform extends Component {
	static typeName = 'Transform'
	x: number
	y: number
	xOff: number
	yOff: number
	dirty: boolean
	static properties = {
		x: 0,
		y: 0,
		xOff: 0,
		yOff: 0,
		dirty: true,
	}
}

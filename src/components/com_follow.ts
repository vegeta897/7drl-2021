import { Component } from 'ape-ecs'
import { Grid } from '../types'

export default class Follow extends Component {
	static typeName = 'Follow'
	target: Grid | null
	newTarget: boolean
	static properties = {
		target: null,
		newTarget: true,
	}
}

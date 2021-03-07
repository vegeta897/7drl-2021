import { Component } from 'ape-ecs'
import { Grid } from '../types'

export default class Follow extends Component {
	static typeName = 'Follow'
	target: Grid | null
	static properties = {
		target: null,
	}
}

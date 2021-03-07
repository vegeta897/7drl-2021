import { Component } from 'ape-ecs'
import { Tween } from '@tweenjs/tween.js'

export default class Tweening extends Component {
	static typeName = 'Tweening'
	tween: Tween<Record<string, unknown>>
	static properties = {
		tween: null,
	}
}

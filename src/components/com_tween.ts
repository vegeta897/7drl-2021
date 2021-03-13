import { Component } from 'ape-ecs'
import { Tween } from '@tweenjs/tween.js'
import { Directions } from '../types'

enum TweenType {
	None,
	Move,
	Attack,
}

export default class Tweening extends Component {
	static typeName = 'Tweening'
	tweenType: TweenType
	direction: Directions
	tweens: Tween<any>[]
	static properties = {
		tweenType: TweenType.None,
		tweens: [],
		direction: null,
	}
	static TweenType = TweenType

	preDestroy() {
		this.tweens.forEach((tween) => tween.end())
	}
}

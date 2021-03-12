import { Component } from 'ape-ecs'
import { Tween } from '@tweenjs/tween.js'

enum TweenType {
	None,
	Move,
	GrindStart,
	GrindContinue,
	GrindEnd,
	Attack,
}

export default class Tweening extends Component {
	static typeName = 'Tweening'
	tweenType: TweenType
	tweens: Tween<any>[]
	static properties = {
		tweenType: TweenType.None,
		tweens: [],
	}
	static TweenType = TweenType

	preDestroy() {
		this.tweens.forEach((tween) => tween.end())
	}
}

import { Component } from 'ape-ecs'

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
	static properties = {
		tweenType: TweenType.None,
	}
	static TweenType = TweenType
}

import { Emitter } from 'pixi-particles'
import { Container, Texture } from 'pixi.js'
import { Grid } from '../types'

export function createSparkEmitter(parent: Container, pos: Grid): Emitter {
	return new Emitter(parent, Texture.WHITE, {
		emit: true,
		autoUpdate: true,
		alpha: {
			start: 1,
			end: 0.8,
		},
		scale: {
			start: 2 / 25,
			end: 1 / 25,
			minimumScaleMultiplier: 1,
		},
		color: {
			start: '#fafa7a',
			end: '#ffcd52',
		},
		acceleration: {
			x: 0,
			y: 1000,
		},
		speed: {
			start: 130,
			end: 0,
			minimumSpeedMultiplier: 0.7,
		},
		maxSpeed: 0,
		startRotation: {
			min: 255,
			max: 285,
		},
		noRotation: true,
		rotationSpeed: {
			min: 0,
			max: 0,
		},
		lifetime: {
			min: 0.1,
			max: 0.1,
		},
		blendMode: 'normal',
		frequency: 0.008,
		emitterLifetime: -1,
		maxParticles: 40,
		pos,
		addAtBack: true,
		spawnType: 'point',
	})
}

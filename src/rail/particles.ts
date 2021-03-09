import { Emitter } from 'pixi-particles'
import { Container, Texture } from 'pixi.js'
import { Directions, Grid } from '../types'

export function getEmitterCoords(dir: Directions): [Grid, Grid] {
	switch (dir) {
		case Directions.Up:
		case Directions.Down:
			return [
				{ x: 4, y: 16 },
				{ x: 12, y: 16 },
			]
		case Directions.Left:
			return [
				{ x: 10, y: 4 },
				{ x: 10, y: 12 },
			]
		case Directions.Right:
			return [
				{ x: 6, y: 4 },
				{ x: 6, y: 12 },
			]
	}
}

export function intensifySparks(emitter: Emitter): void {
	emitter.maxParticles++
	emitter.maxLifetime += 0.01
	emitter.minimumSpeedMultiplier += 0.05
	emitter.minStartRotation = Math.max(200, emitter.minStartRotation - 0.3)
	emitter.maxStartRotation = Math.min(340, emitter.maxStartRotation + 0.3)
	emitter.maxStartRotation += 0.25
	emitter.frequency *= 0.95
}

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
			min: 250,
			max: 290,
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
		frequency: 0.01,
		emitterLifetime: -1,
		maxParticles: 5,
		pos,
		addAtBack: true,
		spawnType: 'point',
	})
}

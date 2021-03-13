import { Emitter } from 'pixi-particles'
import { Container, Texture } from 'pixi.js'
import { Directions, Grid } from '../types'
import { Entity } from 'ape-ecs'
import Particles from '../components/com_particles'

export function addSparkComponents(
	entity: Entity,
	direction: Directions,
	container: Container
) {
	const emitterOptions = getEmitterOptions(direction)
	entity.addComponent({
		type: Particles.typeName,
		emitter: createSparkEmitter(container, emitterOptions[0]),
	})
	entity.addComponent({
		type: Particles.typeName,
		emitter: createSparkEmitter(container, emitterOptions[1]),
	})
}

export function updateSparkComponents(
	particles: Set<Particles>,
	dir: Directions
) {
	const emitterOptions = getEmitterOptions(dir)
	;[...particles].forEach(({ emitter }, p) => {
		emitter.updateSpawnPos(emitterOptions[p].pos.x, emitterOptions[p].pos.y)
		emitter.addAtBack = emitterOptions[p].addAtBack
	})
}

type EmitterOptions = {
	pos: Grid
	addAtBack: boolean
}

function getEmitterOptions(dir: Directions): EmitterOptions[] {
	switch (dir) {
		case Directions.Up:
			return [
				{ pos: { x: 4, y: 14 }, addAtBack: false },
				{ pos: { x: 12, y: 14 }, addAtBack: false },
			]
		case Directions.Down:
			return [
				{ pos: { x: 4, y: 8 }, addAtBack: true },
				{ pos: { x: 12, y: 8 }, addAtBack: true },
			]
		case Directions.Left:
			return [
				{ pos: { x: 10, y: 7 }, addAtBack: true },
				{ pos: { x: 10, y: 15 }, addAtBack: false },
			]
		case Directions.Right:
			return [
				{ pos: { x: 6, y: 7 }, addAtBack: true },
				{ pos: { x: 6, y: 15 }, addAtBack: false },
			]
	}
}

export function intensifySparks(emitter: Emitter): void {
	emitter.maxParticles += 0.5
	emitter.maxLifetime += 0.01
	emitter.minimumSpeedMultiplier += 0.04
	emitter.minStartRotation = Math.max(200, emitter.minStartRotation - 0.1)
	emitter.maxStartRotation = Math.min(340, emitter.maxStartRotation + 0.1)
	emitter.frequency *= 0.98
}

export function createSparkEmitter(
	parent: Container,
	options: EmitterOptions
): Emitter {
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
		...options,
		spawnType: 'point',
	})
}

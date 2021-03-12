import { Entity, System } from 'ape-ecs'
import { Container, Sprite } from 'pixi.js'
import { GlobalEntity, GlobalSprite, Tags } from '../types'
import Health from '../components/com_health'
import {
	changeSpriteTexture,
	createSprite,
	TextureID,
	TILE_SIZE,
} from '../core/sprites'
import Game from '../components/com_game'
import { DeadRailContainer } from '../screens'
import { HEIGHT, WIDTH } from '../index'
import { Easing, Tween } from '@tweenjs/tween.js'

const digitTextureIDs = [
	TextureID.Zero,
	TextureID.One,
	TextureID.Two,
	TextureID.Three,
	TextureID.Four,
	TextureID.Five,
	TextureID.Six,
	TextureID.Seven,
	TextureID.Eight,
	TextureID.Nine,
]

export default class HUDSystem extends System {
	container: Container
	screenContainer: Container | null = null
	healthContainer: Container
	tensDigitSprite: Sprite
	onesDigitSprite: Sprite
	heartSprite: Sprite

	init(container: Container) {
		this.container = container
		this.container.setTransform(0, 0, 3, 3)
		this.healthContainer = new Container()
		this.healthContainer.setTransform(
			WIDTH / 3 - (TILE_SIZE * 3 - 2),
			HEIGHT / 3 - (TILE_SIZE + 2)
		)
		this.container.addChild(this.healthContainer)
		this.tensDigitSprite = createSprite(TextureID.Zero)
		this.onesDigitSprite = createSprite(TextureID.Zero)
		this.onesDigitSprite.x = TILE_SIZE - 6
		this.onesDigitSprite.tint = 0xf5edba
		this.tensDigitSprite.tint = 0xf5edba
		this.heartSprite = createSprite(TextureID.Heart)
		this.heartSprite.x = TILE_SIZE * 2 - 6
		this.healthContainer.addChild(
			this.tensDigitSprite,
			this.onesDigitSprite,
			this.heartSprite
		)
	}
	update(tick) {
		const gameEntity = <Entity>this.world.getEntity(GlobalEntity.Game)!
		const game = <Game>this.world.getEntity(GlobalEntity.Game)!.c.game
		const player = <Entity>this.world.getEntity(GlobalEntity.Player)!
		if (gameEntity.has(Tags.UpdateHUD)) {
			gameEntity.removeTag(Tags.UpdateHUD)
			if (game.gameOver) {
				if (this.screenContainer)
					this.container.removeChild(this.screenContainer)
				this.screenContainer = DeadRailContainer
				this.screenContainer.alpha = 0
				this.container.addChild(this.screenContainer)
				new Tween(this.screenContainer)
					.to({ alpha: 1 }, 2500)
					.delay(500)
					.easing(Easing.Sinusoidal.Out)
					.start()
				const pressEnterSprite = this.screenContainer.getChildByName!(
					GlobalSprite.PressEnter
				)
				pressEnterSprite.alpha = 0
				new Tween(pressEnterSprite)
					.to({ alpha: 1 }, 800)
					.delay(4000)
					.easing(Easing.Sinusoidal.Out)
					.start()
				this.healthContainer.visible = false
				player.c.pixi.object.visible = false
				return
			} else {
				player.c.pixi.object.visible = true
				if (this.screenContainer)
					this.container.removeChild(this.screenContainer)
				this.screenContainer = null
				this.healthContainer.visible = true
			}
		}
		if (!player.has(Tags.UpdateHUD)) return
		player.removeTag(Tags.UpdateHUD)
		const { health } = <{ health: Health }>player.c
		const [tensDigit, onesDigit] = Math.max(0, Math.min(99, health.current))
			.toString()
			.padStart(2, '0')
			.split('')
		if (+tensDigit === 0) {
			this.tensDigitSprite.visible = false
		} else {
			this.tensDigitSprite.visible = true
			changeSpriteTexture(this.tensDigitSprite, digitTextureIDs[+tensDigit])
		}
		changeSpriteTexture(this.onesDigitSprite, digitTextureIDs[+onesDigit])
	}
}

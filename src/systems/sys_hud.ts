import { Entity, System } from 'ape-ecs'
import { Container, Sprite } from 'pixi.js'
import { GlobalEntity, Tags } from '../types'
import Health from '../components/com_health'
import { changeSpriteTexture, createSprite, TextureID } from '../sprites'
import { TILE_SIZE } from '../index'

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
	container!: Container
	tensDigitSprite!: Sprite
	onesDigitSprite!: Sprite
	heartSprite!: Sprite
	init(container: Container) {
		this.container = container
		this.tensDigitSprite = createSprite(TextureID.Zero)
		this.onesDigitSprite = createSprite(TextureID.Zero)
		this.onesDigitSprite.x = TILE_SIZE - 6
		this.heartSprite = createSprite(TextureID.Heart)
		this.heartSprite.x = TILE_SIZE * 2 - 6
		this.container.addChild(
			this.tensDigitSprite,
			this.onesDigitSprite,
			this.heartSprite
		)
	}
	update(tick) {
		const player = <Entity>this.world.getEntity(GlobalEntity.Player)!
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

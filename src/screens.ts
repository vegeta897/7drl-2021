import { createSprite, TextureID, TILE_SIZE } from './core/sprites'
import { Container } from 'pixi.js'
import { GlobalSprite } from './types'

const deadRails: (TextureID | undefined)[][] = [
	[
		TextureID.RailDownRight,
		TextureID.RailLeftRight,
		TextureID.RailDownLeft,
		undefined,
		undefined,
		TextureID.RailDownRight,
		TextureID.RailLeftRight,
		TextureID.RailLeftRight,
		undefined,
		TextureID.RailDownRight,
		TextureID.RailLeftRight,
		TextureID.RailDownLeft,
		undefined,
		TextureID.RailDownRight,
		TextureID.RailLeftRight,
		TextureID.RailDownLeft,
		undefined,
	],
	[
		TextureID.RailUpDown,
		undefined,
		TextureID.RailUpRight,
		TextureID.RailDownLeft,
		undefined,
		TextureID.RailUpDown,
		undefined,
		undefined,
		undefined,
		TextureID.RailUpDown,
		undefined,
		TextureID.RailUpDown,
		undefined,
		TextureID.RailUpDown,
		undefined,
		TextureID.RailUpRight,
		TextureID.RailDownLeft,
	],
	[
		TextureID.RailUpDown,
		undefined,
		undefined,
		TextureID.RailUpDown,
		undefined,
		TextureID.RailUpDownRight,
		TextureID.RailLeftRight,
		undefined,
		undefined,
		TextureID.RailUpDownRight,
		TextureID.RailLeftRight,
		TextureID.RailUpDownLeft,
		undefined,
		TextureID.RailUpDown,
		undefined,
		undefined,
		TextureID.RailUpDown,
	],
	[
		TextureID.RailUpDown,
		undefined,
		undefined,
		TextureID.RailUpDown,
		undefined,
		TextureID.RailUpDown,
		undefined,
		undefined,
		undefined,
		TextureID.RailUpDown,
		undefined,
		TextureID.RailUpDown,
		undefined,
		TextureID.RailUpDown,
		undefined,
		undefined,
		TextureID.RailUpDown,
	],
	[
		TextureID.RailUpRight,
		TextureID.RailLeftRight,
		TextureID.RailLeftRight,
		TextureID.RailUpLeft,
		undefined,
		TextureID.RailUpRight,
		TextureID.RailLeftRight,
		TextureID.RailLeftRight,
		undefined,
		TextureID.RailUpDown,
		undefined,
		TextureID.RailUpDown,
		undefined,
		TextureID.RailUpRight,
		TextureID.RailLeftRight,
		TextureID.RailLeftRight,
		TextureID.RailUpLeft,
	],
]

export const DeadRailContainer = new Container()
DeadRailContainer.setTransform(1.5 * TILE_SIZE, 4 * TILE_SIZE - 5)

const pressEnter = createSprite(TextureID.PressEnter)
pressEnter.name = GlobalSprite.PressEnter
pressEnter.tint = 0xc0c741
pressEnter.setTransform(111, 88)
DeadRailContainer.addChild(pressEnter)

for (const [lineIndex, line] of deadRails.entries()) {
	for (const [railIndex, rail] of line.entries()) {
		if (!rail) continue
		const railSprite = createSprite(rail)
		railSprite.x = railIndex * TILE_SIZE
		railSprite.y = lineIndex * TILE_SIZE
		railSprite.tint = 0xef1d30
		DeadRailContainer.addChild(railSprite)
	}
}

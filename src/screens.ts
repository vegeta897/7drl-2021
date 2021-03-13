import { createSprite, TextureID, TILE_SIZE } from './core/sprites'
import { Container } from 'pixi.js'
import { GlobalSprite } from './types'

const deadRails: string[] = [
	'╔═╗  ╔══ ╔═╗ ╔═╗ ',
	'║ ╚╗ ║   ║ ║ ║ ╚╗',
	'║  ║ ╠═  ╠═╣ ║  ║',
	'║  ║ ║   ║ ║ ║  ║',
	'╚══╝ ╚══ ║ ║ ╚══╝',
]

const winRails: string[] = [
	'║ ║ ╔═╗ ║ ║',
	'╚╦╝ ║ ║ ║ ║',
	' ║  ║ ║ ║ ║',
	' ║  ╚═╝ ╚═╝',
	'           ',
	'║ ║ ║ ║ ╔╗║',
	'║ ║ ║ ║ ║║║',
	'╚╗║╔╝ ║ ║║║',
	' ╚╩╝  ║ ║╚╝',
]

const railCharMap: Map<string, TextureID> = new Map()
railCharMap.set('║', TextureID.RailUpDown)
railCharMap.set('═', TextureID.RailLeftRight)
railCharMap.set('╔', TextureID.RailDownRight)
railCharMap.set('╗', TextureID.RailDownLeft)
railCharMap.set('╝', TextureID.RailUpLeft)
railCharMap.set('╚', TextureID.RailUpRight)
railCharMap.set('╠', TextureID.RailUpDownRight)
railCharMap.set('╣', TextureID.RailUpDownLeft)
railCharMap.set('╩', TextureID.RailUpLeftRight)
railCharMap.set('╦', TextureID.RailDownLeftRight)

export const DeadRailContainer = new Container()
const deadBG = createSprite(TextureID.Blank)
deadBG.x = -(1.5 * TILE_SIZE)
deadBG.y = -(4 * TILE_SIZE - 5)
deadBG.width = 960 / 3
deadBG.height = 720 / 3
deadBG.tint = 0
DeadRailContainer.addChild(deadBG)
DeadRailContainer.setTransform(1.5 * TILE_SIZE, 4 * TILE_SIZE - 5)

const pressEnter = createSprite(TextureID.PressEnter)
pressEnter.name = GlobalSprite.PressEnter
pressEnter.tint = 0xc0c741
pressEnter.setTransform(111, 88)
DeadRailContainer.addChild(pressEnter)

createRailSprites(DeadRailContainer, deadRails, 0xef1d30)

export const WinRailContainer = new Container()
const winBG = createSprite(TextureID.Blank)
winBG.x = -(4 * TILE_SIZE + 6)
winBG.y = -(3 * TILE_SIZE - 3)
winBG.width = 960 / 3
winBG.height = 720 / 3
winBG.tint = 0
WinRailContainer.addChild(winBG)
WinRailContainer.setTransform(4 * TILE_SIZE + 6, 3 * TILE_SIZE - 3)

createRailSprites(WinRailContainer, winRails, 0x20e741)

function createRailSprites(container, rails, tint) {
	for (const [lineIndex, line] of rails.entries()) {
		for (const [railIndex, railChar] of line.split('').entries()) {
			if (railChar === ' ') continue
			const textureID = railCharMap.get(railChar)
			if (!textureID) throw 'invalid railChar ' + railChar
			const railSprite = createSprite(textureID)
			railSprite.x = railIndex * TILE_SIZE
			railSprite.y = lineIndex * TILE_SIZE
			railSprite.tint = tint
			container.addChild(railSprite)
		}
	}
}

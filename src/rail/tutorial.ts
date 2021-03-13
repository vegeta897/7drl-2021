import { Tile } from '../core/level'
import { RailData, Room } from './types'
import { TileMap } from '../util'
import {
	createFloorTile,
	createRailTile,
	createTile,
	createWallTile,
} from './util'

export function getTutorialRoom(xOff = 0, yOff = 0): Room {
	const charMap: Map<
		string,
		{ type: Tile; flow?: RailData['flowMap']; solid?: boolean }
	> = new Map()
	charMap.set('█', { type: Tile.Wall })
	charMap.set('░', { type: Tile.Floor })
	charMap.set('║', { type: Tile.Rail, flow: [0, 1] })
	charMap.set('═', { type: Tile.Rail, flow: [undefined, undefined, 2, 3] })
	charMap.set('╔', { type: Tile.Rail, flow: [3, undefined, 1] })
	charMap.set('╗', { type: Tile.Rail, flow: [2, undefined, undefined, 1] })
	charMap.set('╝', { type: Tile.Rail, flow: [undefined, 2, undefined, 0] })
	charMap.set('╚', { type: Tile.Rail, flow: [undefined, 3, 0, undefined] })
	charMap.set('H', { type: Tile.HoldShift, solid: true })
	charMap.set('S', { type: Tile.Floor, solid: true })

	const tutorialTiles = new TileMap()
	tileCharMap.forEach((row, y) => {
		row.split('').forEach((tileChar, x) => {
			const tileInfo = charMap.get(tileChar)
			if (!tileInfo) return
			let tile
			if (tileInfo.type === Tile.Wall) tile = createWallTile(x + xOff, y + yOff)
			if (tileInfo.type === Tile.Floor)
				tile = createFloorTile(x + xOff, y + yOff)
			if (tileInfo.type === Tile.Rail)
				tile = createRailTile(x + xOff, y + yOff, {
					flowMap: tileInfo.flow!,
					booster: false,
				})
			if (tileInfo.solid)
				tile = createTile(x + xOff, y + yOff, tileInfo.type, true, true)
			if (tile) tutorialTiles.addTile(tile)
		})
	})
	return {
		x1: 0,
		x2: 30,
		y1: 0,
		y2: 30,
		width: 30,
		height: 30,
		tiles: tutorialTiles,
	}
}

export const DummyLocations = [
	[-3, -10], // Relative to player start
	[-5, -12],
	[-1, -13],
	[-3, -15],
	[-4, -15],
	[-5, -15],
]

const tileCharMap = [
	' █████░█',
	'H█SSS╔╗█',
	' █SSS░║███████',
	' █████░═════░█ ███',
	'     ███████║█ █║█',
	'       █╔═░═╝███║█████',
	'       █░█████░░║░░═╗█',
	'       █░░░░░█░█║███║██',
	'       █░░░░░█░█║█╔░╚═█',
	'       █░░░░░░░███║█████',
	'       █░░░░░███ █║██╔╗█',
	'       ███████   █╚░═╝║█',
	'                ██████░██████',
	'                █░══════════█',
	'                █║███████░███',
	'                █║██░░░░░░█',
	'           ██████║██░░░████',
	'           █░░░█░░░█░░░█',
	'           █░░░░░░░█████',
	'           █░░░█░░░█',
	'           █████████',
]

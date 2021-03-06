import { Query, System } from 'ape-ecs'
import { Tile } from '../components/com_tile'

export const TILE_SIZE = 16

export default class TileSystem extends System {
	private tilesUpdated!: Query
	init() {
		this.tilesUpdated = this.createQuery({
			all: [Tile],
			persist: true,
		})
	}
	update(tick: number) {
		this.tilesUpdated.execute().forEach((entity) => {
			if (entity.c.tile._meta.updated !== tick) return
			updateSpritePosition(entity.c.tile)
		})
	}
}

function updateSpritePosition(tile) {
	tile.sprite.x = tile.x * TILE_SIZE
	tile.sprite.y = tile.y * TILE_SIZE
}

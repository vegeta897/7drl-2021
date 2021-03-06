import { World } from 'ape-ecs'
import { Controller } from './components/com_controller'
import { Move } from './components/com_move'
import { Tile } from './components/com_tile'
import { SystemGroup, Tags } from './types'
import InputSystem from './systems/sys_input'
import ActionSystem from './systems/sys_action'
import MoveSystem from './systems/sys_move'
import TileSystem from './systems/sys_tile'
import { Player } from './components/com_player'
import { CameraSystem } from './systems/sys_camera'
import Follow from './components/com_follow'
import FOVSystem from './systems/sys_fov'
import LevelData from './components/com_level'

export const world = new World()

export function initWorld({ viewport }) {
	world.registerComponent(Controller, 1)
	world.registerComponent(Move, 20)
	world.registerComponent(Tile, 1000)
	world.registerComponent(Player, 1)
	world.registerComponent(Follow, 1)
	world.registerComponent(LevelData, 1)
	world.registerTags(...Object.values(Tags))

	world.registerSystem(SystemGroup.Input, InputSystem)
	world.registerSystem(SystemGroup.Update, ActionSystem)
	world.registerSystem(SystemGroup.Update, MoveSystem)
	world.registerSystem(SystemGroup.Update, TileSystem)
	world.registerSystem(SystemGroup.Update, FOVSystem)
	world.registerSystem(SystemGroup.Update, CameraSystem, [viewport])
}

export function updateWorld() {
	world.runSystems(SystemGroup.Update)
}

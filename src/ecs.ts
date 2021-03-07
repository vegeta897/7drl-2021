import { World } from 'ape-ecs'
import Controller from './components/com_controller'
import Move from './components/com_move'
import Tile from './components/com_tile'
import { SystemGroup, Tags } from './types'
import InputSystem from './systems/sys_input'
import ActionSystem from './systems/sys_action'
import MoveSystem from './systems/sys_move'
import TileSystem from './systems/sys_tile'
import Player from './components/com_player'
import CameraSystem from './systems/sys_camera'
import Follow from './components/com_follow'
import FOVSystem from './systems/sys_fov'
import Grinding from './components/com_grinding'
import GrindingSystem from './systems/sys_grinding'
import PixiObject from './components/com_pixi'
import Tweening from './components/com_tweening'
import Game from './components/com_game'
import GameSystem from './systems/sys_game'

export const world = new World()

export function initWorld({ viewport }) {
	world.registerComponent(Game, 1)
	world.registerComponent(Controller, 1)
	world.registerComponent(PixiObject, 100)
	world.registerComponent(Move, 20)
	world.registerComponent(Tile, 1000)
	world.registerComponent(Tweening, 100)
	world.registerComponent(Player, 1)
	world.registerComponent(Follow, 1)
	world.registerComponent(Grinding, 10)
	world.registerTags(...Object.values(Tags))

	world.registerSystem(SystemGroup.Input, InputSystem)
	world.registerSystem(SystemGroup.Input, ActionSystem)
	world.registerSystem(SystemGroup.Update, MoveSystem)
	world.registerSystem(SystemGroup.Update, GrindingSystem)
	world.registerSystem(SystemGroup.Update, TileSystem)
	world.registerSystem(SystemGroup.Update, FOVSystem)
	world.registerSystem(SystemGroup.Update, CameraSystem, [viewport])
	world.registerSystem(SystemGroup.Update, GameSystem)
}

export function updateWorld() {
	world.runSystems(SystemGroup.Update)
}

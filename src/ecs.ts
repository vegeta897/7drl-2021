import { World } from 'ape-ecs'
import Controller from './components/com_controller'
import Move from './components/com_move'
import Transform from './components/com_transform'
import { SystemGroup, Tags } from './types'
import InputSystem from './systems/sys_input'
import ActionSystem from './systems/sys_action'
import CollisionSystem from './systems/sys_collision'
import TransformSystem from './systems/sys_transform'
import Player from './components/com_player'
import CameraSystem from './systems/sys_camera'
import Follow from './components/com_follow'
import FOVSystem from './systems/sys_fov'
import Grinding from './components/com_grinding'
import GrindingSystem from './systems/sys_grinding'
import PixiObject from './components/com_pixi'
import Game from './components/com_game'
import GameSystem from './systems/sys_game'
import TweenSystem from './systems/sys_tween'
import PixiSystem from './systems/sys_pixi'
import Particles from './components/com_particles'

export const world = new World()

export function initWorld({ viewport }) {
	world.registerComponent(Game, 1)
	world.registerComponent(Controller, 1)
	world.registerComponent(PixiObject, 100)
	world.registerComponent(Move, 20)
	world.registerComponent(Transform, 1000)
	world.registerComponent(Player, 1)
	world.registerComponent(Follow, 1)
	world.registerComponent(Grinding, 10)
	world.registerComponent(Particles, 20)
	world.registerTags(...Object.values(Tags))

	world.registerSystem(SystemGroup.Input, InputSystem)
	world.registerSystem(SystemGroup.Input, ActionSystem)
	world.registerSystem(SystemGroup.Update, GrindingSystem)
	world.registerSystem(SystemGroup.Update, CollisionSystem)
	world.registerSystem(SystemGroup.Update, TweenSystem)
	world.registerSystem(SystemGroup.Update, TransformSystem)
	world.registerSystem(SystemGroup.AfterUpdate, FOVSystem)
	world.registerSystem(SystemGroup.AfterUpdate, GameSystem)
	world.registerSystem(SystemGroup.Render, PixiSystem)
	world.registerSystem(SystemGroup.Render, CameraSystem, [viewport])
}

export function updateWorld() {
	world.runSystems(SystemGroup.Update)
	afterUpdateWorld()
}
export function afterUpdateWorld() {
	world.runSystems(SystemGroup.AfterUpdate)
}

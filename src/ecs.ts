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
import TweenSystem from './systems/sys_tween'
import PixiSystem from './systems/sys_pixi'
import Particles from './components/com_particles'
import FollowSystem from './systems/sys_follow'
import Attack from './components/com_attack'
import AttackSystem from './systems/sys_attack'
import Tweening from './components/com_tween'
import PlayerSystem from './systems/sys_player'

export const world = new World()

export function initWorld({ viewport }) {
	world.registerComponent(Game, 1)
	world.registerComponent(Controller, 1)
	world.registerComponent(PixiObject, 100)
	world.registerComponent(Move, 20)
	world.registerComponent(Transform, 100)
	world.registerComponent(Tweening, 100)
	world.registerComponent(Player, 1)
	world.registerComponent(Follow, 20)
	world.registerComponent(Grinding, 10)
	world.registerComponent(Particles, 20)
	world.registerComponent(Attack, 10)
	world.registerTags(...Object.values(Tags))

	world.registerSystem(SystemGroup.Input, InputSystem)
	world.registerSystem(SystemGroup.Input, ActionSystem)
	world.registerSystem(SystemGroup.Main, PlayerSystem)
	world.registerSystem(SystemGroup.Main, FollowSystem)
	world.registerSystem(SystemGroup.Main, GrindingSystem)
	world.registerSystem(SystemGroup.Main, CollisionSystem)
	world.registerSystem(SystemGroup.Main, TransformSystem)
	world.registerSystem(SystemGroup.Main, AttackSystem)
	world.registerSystem(SystemGroup.Main, TweenSystem)
	world.registerSystem(SystemGroup.Main, FOVSystem)
	world.registerSystem(SystemGroup.Render, PixiSystem)
	world.registerSystem(SystemGroup.Render, CameraSystem, [viewport])
}

export function runMainSystems() {
	world.runSystems(SystemGroup.Main)
	world.tick()
}

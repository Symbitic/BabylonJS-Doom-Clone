import { Color4, ParticleSystem, Texture, Vector3 } from "@babylonjs/core";
import { scene } from './globals';
import type { AbstractMesh, Nullable } from "@babylonjs/core";

export interface IParticleEffect {
  amount: number;
  particleTexture: Texture;
  minSize: number;
  maxSize: number;
  emitRate: number;
  targetStopDuration: number;
  maxEmitPower?: number;
  minEmitPower?: number;
  color1: Color4;
  color2: Color4;
  gravity: Vector3;
  disposeOnStop: boolean;
  direction1: Vector3;
  direction2: Vector3;
  minLifeTime?: number;
  maxLifeTime?: number;
}

export class ParticleManager {
  private _systems: Record<string, ParticleSystem> = {};

  readonly effectsProperties: Record<string, IParticleEffect> = {
    blood: {
      amount: 1000,
      particleTexture: new Texture("textures/flare.png", scene),
      minSize: 0.1,
      maxSize: 0.3,
      emitRate: 6000,
      targetStopDuration: 1,
      maxEmitPower: 1,
      color1: new Color4(0.1, 0, 0, 1),
      color2: new Color4(0.1, 0, 0, 1),
      gravity: new Vector3(0, -150.81, 0),
      disposeOnStop: true,
      direction1: new Vector3(-7, 8, 3),
      direction2: new Vector3(7, 8, -3),
    },
    blueBlood: {
      amount: 1000,
      particleTexture: new Texture("textures/flare.png", scene),
      minSize: 0.1,
      maxSize: 0.3,
      emitRate: 6000,
      targetStopDuration: 1,
      maxEmitPower: 1,
      color1: new Color4(0, 0, 1, 1),
      color2: new Color4(0, 0, 1, 1),
      gravity: new Vector3(0, -150.81, 0),
      disposeOnStop: true,
      direction1: new Vector3(-7, 8, 3),
      direction2: new Vector3(7, 8, -3),
      minLifeTime: 0.3,
      maxLifeTime: 1,
    },
    bulletPuff: {
      amount: 10,
      particleTexture: new Texture("textures/flare.png", scene),
      minSize: 0.05,
      maxSize: 0.05,
      emitRate: 6000,
      targetStopDuration: 1,
      minEmitPower: 10,
      color1: new Color4(1, 1, 1, 1),
      color2: new Color4(1, 1, 1, 1),
      gravity: new Vector3(0, 0, 0),
      disposeOnStop: true,
      direction1: new Vector3(0.5, 0.5, 0.5),
      direction2: new Vector3(-0.5, 0.5, -0.5),
      minLifeTime: 0.3,
      maxLifeTime: 1,
    },
    rocketTrail: {
      amount: 5000,
      particleTexture: new Texture("textures/flare.png", scene),
      minSize: 0.4,
      maxSize: 0.5,
      emitRate: 500,
      targetStopDuration: 100,
      maxEmitPower: 10,
      color1: new Color4(1, 0, 0, 1),
      color2: new Color4(0.5, 0, 0, 1),
      gravity: new Vector3(0, 0, 0),
      disposeOnStop: false,
      direction1: new Vector3(0, 0, 0),
      direction2: new Vector3(0, 0, 0),
      minLifeTime: 0.3,
      maxLifeTime: 1,
    }
  };

  init() {
    this.run();
  }

  run() {
    for (const effectName in this.effectsProperties) {
      const props = this.effectsProperties[effectName];
      this._systems[effectName] = new ParticleSystem("particles", props.amount, scene);

      // this[effectName] is now a ParticleSystem object and needs to be configured
      this._systems[effectName].particleTexture = props.particleTexture;
      this._systems[effectName].minSize = props.minSize;
      this._systems[effectName].maxSize = props.maxSize;
      this._systems[effectName].emitRate = props.emitRate;
      this._systems[effectName].targetStopDuration = props.targetStopDuration;
      this._systems[effectName].maxEmitPower = props.maxEmitPower!;
      this._systems[effectName].color1 = props.color1;
      this._systems[effectName].color2 = props.color2;
      this._systems[effectName].gravity = props.gravity;
      this._systems[effectName].disposeOnStop = props.disposeOnStop;
      this._systems[effectName].direction1 = props.direction1;
      this._systems[effectName].direction2 = props.direction2;
      this._systems[effectName].minLifeTime = props.minLifeTime!;
      this._systems[effectName].maxLifeTime = props.maxLifeTime!;
    }
  }

  emit(type: string, emitter: Nullable<Vector3 | AbstractMesh>, amount?: number) {
    const clonedParticleSystem = this._systems[type].clone("", emitter);
    amount ? (clonedParticleSystem as any)._capacity = amount : 500;
    clonedParticleSystem.emitter = emitter;
    clonedParticleSystem.start();
    return clonedParticleSystem;
  }
}

export const particleManager = new ParticleManager();

export default particleManager;

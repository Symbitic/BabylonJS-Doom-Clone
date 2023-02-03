import { Sound } from "@babylonjs/core";
import { scene } from "./globals";

export const sounds: Record<string, Sound> = {};

const soundFileNames: Record<string, string> = {
    'shotgun': 'shotgunBlast.wav',
    'pain': 'pain.wav',
    'impDeath1': 'impDeath1.wav',
    'impDeath2': 'impDeath2.wav',
    'doomGuyInPain': 'doomguyinpain.wav',
    'fireball': 'fireball.wav',
    'chaingun': 'chaingun.wav',
    'd_e2m1': 'd_e2m1.mid',
    'sun': 'sun.mp3',
    'hurt_cacodemon': 'hurt_cacodemon.wav',
    'death_cacodemon': 'death_cacodemon.wav',
    'shoot_rocketlauncher': 'shoot_rocketlauncher.wav',
    'explode_rocketlauncher': 'explode_rocketlauncher.wav'
}

for (const name in soundFileNames) {
    sounds[name] = new Sound(name, `sounds/${soundFileNames[name]}`, scene, null, { spatialSound: true });
}

export default sounds;

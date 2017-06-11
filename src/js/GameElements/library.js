import { PhysicalElement } from "./PhysicalElement";
import { BlackMatter } from "./BlackMatter";
import { ElectricParticle } from "./ElectricParticle";
import { ElectricPlanetParticle } from "./ElectricPlanetParticle";
import { Particle } from "./Particle";
import { Planet } from "./Planet";
import { Obstacle } from "./Obstacle";
import { Player } from "./Player";

let library = {
	
	PhysicalElement: PhysicalElement,
	BlackMatter: BlackMatter,
	ElectricParticle: ElectricParticle,
	ElectricPlanetParticle: ElectricPlanetParticle,
	Particle: Particle,
	Obstacle: Obstacle,
	Planet: Planet,
	Player: Player,

}

export { library };
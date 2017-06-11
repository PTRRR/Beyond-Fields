import { PhysicalElement } from "./PhysicalElement";

export class Particle extends PhysicalElement {

	constructor ( _options )  {

		super ( _options );

		this.radius = 0;
		this.charge = 1;

	}

	update () {

		super.update ();

		this.color[ 3 ] = this.lifePercent;

		this.radius += ( this.initialRadius - this.radius ) * 0.08;

		this.scale = vec3.fromValues ( this.lifePercent * this.radius, this.lifePercent * this.radius, this.lifePercent * this.radius );

	}

}
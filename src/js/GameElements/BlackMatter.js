import { PhysicalElement } from "./PhysicalElement";

export class BlackMatter extends PhysicalElement {

	constructor ( _options )  {

		super ( _options );

		this.targetScale = vec3.clone ( this.scale );
		this.scale = vec3.create();
		this.applyForce ( [ ( Math.random () - 0.5 ) * 300, ( Math.random () - 0.5 ) * 300, ( Math.random () - 0.5 ) * 300 ] );

		this.maxMass = this.mass;
		this.targetMass = this.maxMass;
		this.mass = 0;

		this.enabled = true;

	}

	update () {

		super.update ();

		this.scale[ 0 ] += ( this.targetScale[ 0 ] - this.scale[ 0 ] ) * 0.07;
		this.scale[ 1 ] += ( this.targetScale[ 1 ] - this.scale[ 1 ] ) * 0.07;
		this.scale[ 2 ] += ( this.targetScale[ 2 ] - this.scale[ 2 ] ) * 0.07;

		this.mass = ( this.scale[ 0 ] / this.targetScale[ 0 ] ) * this.targetMass;
		this.targetMass = this.maxMass * this.lifePercent;

		this.color[ 3 ] = this.lifePercent;

	}

}
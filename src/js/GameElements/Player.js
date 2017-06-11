import { PhysicalElement } from "./PhysicalElement";

export class Player extends PhysicalElement {

	constructor ( _options )  {

		super ( _options );

		this.length = this.scale[ 1 ];
		this.sign = 1;
		this.charge = 1;

	}

	update () {

		super.update ();

		// console.log(obj);
		

		this.scale[ 1 ] = this.length + vec3.length ( this.velocity ) * 1 ;
		this.rotation[ 2 ] = Math.atan2 ( this.velocity[ 1 ], this.velocity[ 0 ] ) - Math.PI * 0.5;

	}

}
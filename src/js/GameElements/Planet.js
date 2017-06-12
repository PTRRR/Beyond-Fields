import { clamp } from "../utils";
import { PhysicalElement } from "./PhysicalElement";

export class Planet extends PhysicalElement {

	constructor ( _options )  {

		super ( _options );

		this.sign = 1;
		this.maxCharge = _options.maxCharge || 50;
		this.minCharge =  _options.minCharge || -50;
		this.charge = _options.charge || 0;

		this.charges = [];
		this.maxMass = this.mass;

	}

	update () {

		super.update ();

		this.charge = clamp ( this.charge, this.minCharge, this.maxCharge );

		let stepCharge = this.charges.length / this.maxCharge;

		let maxIndex = Math.floor ( Math.abs ( this.charge / this.maxCharge ) * this.charges.length );

		for ( let i = 0; i < this.charges.length; i ++ ) {

			if ( i <= maxIndex ) this.charges[ i ].charge = this.sign;
			else this.charges[ i ].charge = 0;

		}

	}

}
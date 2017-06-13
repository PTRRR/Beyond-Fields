import { clamp } from "../utils";
import { PhysicalElement } from "./PhysicalElement";

export class Planet extends PhysicalElement {

	constructor ( _options )  {

		super ( _options );

		this.sign = 1;
		this.maxCharge = _options.maxCharge || 50;
		this.minCharge =  _options.minCharge || -50;
		this.charge = _options.charge || 0;
		this.targetCharge = this.charge;

		this.charges = [];
		this.maxMass = this.mass;

	}

	update () {

		super.update ();

		this.targetCharge = clamp ( this.targetCharge, this.minCharge, this.maxCharge );

		this.charge += ( this.targetCharge - this.charge ) * 0.1;

		let stepCharge = this.charges.length / this.maxCharge;

		let maxIndex = Math.floor ( Math.abs ( this.charge / this.maxCharge ) * this.charges.length );

		for ( let i = 0; i < this.charges.length; i ++ ) {

			if ( i <= maxIndex ) this.charges[ i ].charge = this.sign;
			else this.charges[ i ].charge = 0;

		}

	}

}
import { PhysicalElement } from "./PhysicalElement";

export class ElectricPlanetParticle extends PhysicalElement {

	constructor ( _options )  {

		super ( _options );

		// Charge

		this.chargeDenominator = -3;
		this.sign = _options.sign || ( Math.random() > 0.5 ? 1 : -1 );
		this.minCharge = _options.minCharge || -10.0 * Math.pow ( 10, this.chargeDenominator );
		this.maxCharge = _options.maxCharge || 10.0 * Math.pow ( 10, this.chargeDenominator ); 

		this.charge = 0; // μC ( micro Coulombs );

		// Scale

		this.maxRadius = _options.maxRadius || 20;
		this.minRadius = _options.minRadius || 0.0;
		this.rangeScale = this.maxRadius - this.minRadius;
		this.radius = _options.radius || 0.2;
		this.targetRadius = Math.random () * 0.1 + 0.07;

		// Position

		this.targetPosition = vec3.clone ( this.position );

		// Color

		this.neutralColor = vec4.fromValues ( 0.7, 0.7, 0.7, 1.0 );
		this.positiveColor = vec4.fromValues ( 252/255 + rCV(), 74/255 + rCV(), 50/255 + rCV(), 1.0 );
		this.negativeColor = vec4.fromValues ( 50/255 + rCV(), 104/255 + rCV(), 252/255 + rCV(), 1.0 );
		this.color = vec4.clone ( this.neutralColor );

		function rCV () {

			return ( Math.random() - 0.5 ) * 0.1;

		}

	}

	update () {

		super.update ();

		// Clamp scale 

		if ( this.targetRadius > this.maxRadius ) {

			this.targetRadius = this.maxRadius;

		} else if ( this.targetRadius < this.minRadius ) {

			this.targetRadius = this.minRadius

		}
		
		// Interpolate scale changes to make a smooth animation.

		this.radius += ( this.targetRadius - this.radius ) * 0.1;
		this.scale = vec3.fromValues ( this.radius, this.radius, this.radius );

		// Change the value of the color acoording to the charge.

		if ( this.charge > 0.0001 ) {

			this.color[ 0 ] += ( this.positiveColor[ 0 ] - this.color[ 0 ] ) * 0.05;
			this.color[ 1 ] += ( this.positiveColor[ 1 ] - this.color[ 1 ] ) * 0.05;
			this.color[ 2 ] += ( this.positiveColor[ 2 ] - this.color[ 2 ] ) * 0.05;

		} else if ( this.charge < -0.0001 ) {

			this.color[ 0 ] += ( this.negativeColor[ 0 ] - this.color[ 0 ] ) * 0.05;
			this.color[ 1 ] += ( this.negativeColor[ 1 ] - this.color[ 1 ] ) * 0.05;
			this.color[ 2 ] += ( this.negativeColor[ 2 ] - this.color[ 2 ] ) * 0.05;

		} else {

			this.color[ 0 ] += ( this.neutralColor[ 0 ] - this.color[ 0 ] ) * 0.05;
			this.color[ 1 ] += ( this.neutralColor[ 1 ] - this.color[ 1 ] ) * 0.05;
			this.color[ 2 ] += ( this.neutralColor[ 2 ] - this.color[ 2 ] ) * 0.05;

		}


		// Update the position.

		let dir = vec3.sub ( vec3.create(), this.targetPosition, this.position );
		vec3.scale ( dir, dir, 1 );
		this.applyForce ( dir );

	}

}
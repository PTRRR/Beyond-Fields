import { PhysicalElement } from "./PhysicalElement";

export class ElectricParticle extends PhysicalElement {

	constructor ( _options )  {

		super ( _options );

		this.isKilled = false;

		// Charge

		this.chargeDenominator = -3;
		this.sign = _options.sign || ( Math.random() > 0.5 ? 1 : -1 );
		this.minCharge = _options.minCharge || -10.0 * Math.pow ( 10, this.chargeDenominator );
		this.maxCharge = _options.maxCharge || 10.0 * Math.pow ( 10, this.chargeDenominator ); 

		this.charge = _options.charge || 1; // μC ( micro Coulombs );

		// Scale

		this.maxRadius = _options.minRadius || 0.8;
		this.minRadius = _options.maxRadius || 0.25;
		this.rangeScale = this.maxRadius - this.minRadius;
		this.targetRadius = _options.targetRadius || 0.2;
		this.radius = 0;

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

		if ( this.isKilled ) {

			this.radius += ( 0.2 - this.radius ) * 0.005;
			this.scale = vec3.fromValues ( this.radius, this.radius, this.radius );
			this.color[ 3 ] = this.lifePercent;
			return;

		}


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

		// Update charge according to the size.

		this.charge = ( ( this.radius - this.minRadius ) / this.maxRadius ) * this.maxCharge * this.sign;

		// Update the position.

		let dir = vec3.sub ( vec3.create(), this.targetPosition, this.position );
		vec3.scale ( dir, dir, 0.5 );
		this.applyForce ( dir );

	}

	kill () {

		// this.applyForce ( vec3.fromValues ( ( Math.random () - 0.5 ) * 1, ( Math.random () - 0.5 ) * 1, ( Math.random () - 0.5 ) * 1 ) );
		this.drag = 0.99;
		this.enabled = true;
		this.isKilled = true;
		this.canDye = true;
		this.lifeSpan = 300 + Math.random () * 500;
		this.lifeLeft = this.lifeSpan;

	}

}
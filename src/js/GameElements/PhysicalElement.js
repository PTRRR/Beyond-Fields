import { ElementCore } from "./ElementCore";

export class PhysicalElement extends ElementCore {

	constructor ( _options )  {

		super ( _options );

		_options = _options || {};

		this.position = _options.position ? [ _options.position[ 0 ], _options.position[ 1 ], _options.position[ 2 ] ] : [ 0, 0, 0 ];
		this.rotation = _options.rotation ? [ _options.rotation[ 0 ], _options.rotation[ 1 ], _options.rotation[ 2 ] ] : [ 0, 0, 0 ];
		this.scale = _options.scale ? [ _options.scale[ 0 ], _options.scale[ 1 ], _options.scale[ 2 ] ] : [ 0, 0, 0 ];

		this.velocity = _options.velocity ? [ _options.velocity[ 0 ], _options.velocity[ 1 ], _options.velocity[ 2 ] ] : [ 0, 0, 0 ];
		this.acceleration = _options.acceleration ? [ _options.acceleration[ 0 ], _options.acceleration[ 1 ], _options.acceleration[ 2 ] ] : [ 0, 0, 0 ];

		this.mass = _options.mass || 2.0;
		this.drag = _options.drag || 0.7;
		this.maxSpeed = _options.maxSpeed || 0.5;

	}

	applyForce ( _force ) {

		let newForce = this.divScal ( _force, this.mass );
		this.acceleration = this.add ( this.acceleration, newForce );

	}

	update () {

		super.update ();

		if ( !this.enabled ) return;

		this.acceleration = this.mulScal ( this.acceleration, this.deltaTime / 16 );
		this.velocity = this.add ( this.velocity, this.acceleration );
		this.velocity = this.mulScal ( this.velocity, this.drag );
		
		if ( this.len ( this.velocity ) > this.maxSpeed ) {

			this.velocity = this.norm ( this.velocity );
			this.velocity = this.mulScal ( this.velocity, this.maxSpeed );

		}

		this.position = this.add ( this.position, this.velocity );
		this.acceleration = this.mulScal ( this.acceleration, 0 );

	}

	add ( _v0, _v1 ) {

		return [ _v0[ 0 ] + _v1[ 0 ], _v0[ 1 ] + _v1[ 1 ], _v0[ 2 ] + _v1[ 2 ] ];

	}

	sub ( _v0, _v1 ) {

		return [ _v0[ 0 ] - _v1[ 0 ], _v0[ 1 ] - _v1[ 1 ], _v0[ 2 ] - _v1[ 2 ] ];

	}

	mul ( _v0, _v1 ) {

		return [ _v0[ 0 ] * _v1[ 0 ], _v0[ 1 ] * _v1[ 1 ], _v0[ 2 ] * _v1[ 2 ] ];

	}

	mulScal ( _v0, _s ) {

		return [ _v0[ 0 ] * _s, _v0[ 1 ] * _s, _v0[ 2 ] * _s ];

	}

	div ( _v0, _v1 ) {

		return [ _v0[ 0 ] / _v1[ 0 ], _v0[ 1 ] / _v1[ 1 ], _v0[ 2 ] / _v1[ 2 ] ];

	}

	divScal ( _v0, _s ) {

		return [ _v0[ 0 ] / _s, _v0[ 1 ] / _s, _v0[ 2 ] / _s ];

	}

	len ( _v ) {

		return Math.sqrt ( Math.pow ( _v[ 0 ], 2 ) + Math.pow ( _v[ 1 ], 2 ) + Math.pow ( _v[ 2 ], 2 ) );

	}

	norm ( _v ) {

		let l = this.len ( _v );
		return [ _v[ 0 ] / l, _v[ 1 ] / l, _v[ 2 ] / l ];

	}

}
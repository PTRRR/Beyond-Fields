export class ElementCore {

	constructor ( _options ) {

		_options = _options || {};

		this.type = this.constructor.name;
		this.name = _options.name || 'gameElement';
		this.color = _options.color || [ 1, 1, 1, 1 ];
		this.enabled = _options.enabled;

		this.canDye = _options.canDye || false;
		this.lifeSpan = _options.lifeSpan || 10000.0;
		this.lifeLeft = _options.lifeLeft || this.lifeSpan;

		this.lastTime = performance.now();
		this.time = this.lastTime;
		this.deltaTime = this.time - this.lastTime;

		this.lifeStartMultiplier = 0;
		this.lifeStartSpeed = _options.lifeStartSpeed || 0.05;

		for ( let o in _options ) {

			if ( !this[ o ] ) this[ o ] = _options[ o ];

		}

	}

	update () {

		this.time = performance.now();
		this.deltaTime = this.time - this.lastTime;
		this.lastTime = this.time;

		this.lifeStartMultiplier += ( 1 - this.lifeStartMultiplier ) * this.lifeStartSpeed; 
		this.lifeLeft -= this.deltaTime;

		// Clamp the value when it reaches 0.

		this.lifeLeft = Math.max ( 0, this.lifeLeft );

	}

	get lifePercent () {

		return this.lifeLeft / this.lifeSpan;

	}

	isDead () {

		if ( !this.canDye ) return false;
		if ( this.lifeLeft > 0 ) return false;
		else return true;

	}

}
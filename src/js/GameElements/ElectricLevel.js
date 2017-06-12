import { LevelCore } from "./LevelCore";
import { shaderHelper } from "./shaderHelper";

export class ElectricLevel extends LevelCore {

	constructor ( _options ) {

		try {

			super ( _options );
			this.build ();
			
		} catch ( e ) {

			console.error ( e );

		}

		this.ready = false;
		this.createdInstance = null;
		this.currentInstance = null;
		this.mouseOnDown = null;

		// Build scan background

		let maxScale = this.getWorldRight () > this.getWorldTop () ? this.getWorldRight () * 2 : this.getWorldTop () * 2;
		this.scanGeometry = new THREE.PlaneGeometry ( 1, 1, 300, 300 );
		this.scanMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.equipotentialLines.vertex,
			fragmentShader: shaderHelper.equipotentialLines.fragment,
			transparent: true,

			uniforms: {


				numCharges: { value: 0 },
				charges: { value: [ 0, 0, 0 ] },

			}

		} );

		this.scanMesh = new THREE.Mesh ( this.scanGeometry, this.scanMaterial );
		this.scanMesh.scale.set ( maxScale, maxScale, 1.0 );
		this.scanScene.add ( this.scanMesh );
		this.scanMaterial.extensions.derivatives = true;

	}

	build () {

		super.build ();

	}

	onUp ( _position ) {

		super.onUp ( _position );

		this.currentInstance = null;
		this.createdInstance = null;

	} 

	onDown ( _position ) {

		super.onDown ( _position );

		if ( !this.activeScreen ) {

			this.currentInstance = this.checkCharges ( vec3.fromValues ( this.mouseWorld.x, this.mouseWorld.y, this.mouseWorld.z ) );

			if ( !this.currentInstance ) {

				this.createdInstance = this.addInstanceOf ( 'charges', {

					position: [ this.mouseWorld.x, this.mouseWorld.y, this.mouseWorld.z ],
					color: [ 0.0, 0.0, 0.0, 1.0 ],
					rotation: [ 0, 0, Math.random () * Math.PI * 2 ],
					mass: 15,
					drag: 0.85,
					enabled: true,

				} );

			}

		}

		this.mouseOnDown = vec3.fromValues ( this.mouseWorld.x, this.mouseWorld.y, this.mouseWorld.z );

	}

	onClick ( _position ) {

		super.onClick ( _position );

	}

	onMove ( _position ) {

		super.onMove ( _position );

	} 

	onDrag ( _position ) {

		super.onDrag ( _position );

		let mouse = vec3.fromValues ( this.mouseWorld.x, this.mouseWorld.y, this.mouseWorld.z );

		if ( this.createdInstance ) {

			let dist = vec3.length ( vec3.sub ( vec3.create(), this.createdInstance.position, mouse ) );
			let yDist = mouse[ 1 ] - this.createdInstance.position[ 1 ];
			this.createdInstance.sign = Math.sign ( yDist );
			this.createdInstance.targetRadius = dist;

		} else if ( this.currentInstance ) {

			let dir = null;
			let dist = null;
			let yDist = null;

			switch ( this.currentInstance.type ) {

				case 'center':

					this.currentInstance.element.targetPosition = mouse;
					this.currentInstance.element.targetRadius = 0;
					this.d

				break;

				case 'edge':

					dist = vec3.length ( vec3.sub ( vec3.create(), this.currentInstance.element.position, mouse ) );
					yDist = mouse[ 1 ] - this.currentInstance.element.position[ 1 ];
					this.currentInstance.element.sign = Math.sign ( yDist );
					this.currentInstance.element.targetRadius = dist;

				break;

			} 

		}

	}

	update () {

		// Check if all is loaded.

		if ( !this.ready ) {

			if ( Object.keys( this.gameElements ).length == this.elementToLoad ) {

				this.ready = true;
				this.resetPlayer ();
				// this.start = this.getInstanceByName ( 'goals', 'top' );
				// this.arrival = this.getInstanceByName ( 'goals', 'bottom' );
				this.arrivedInGame = false;
				this.gameElements.player.instances[ 0 ].mass = 400;
				this.resetPlayer();

			} else {

				return;

			}

		}

		super.update ();

		// main player

		let player = this.gameElements.player.instances[ 0 ];
		if ( this.checkEdges ( player.position, 0.2 ) && this.arrivedInGame ) this.resetPlayer ();
		// if ( this.isInBox ( this.arrival, player.position ) ) this.onWinCallback ();
		// if ( this.isInBox ( this.start, player.position ) ) this.arrivedInGame = true;

		// Obstacles

		let obstacles = this.gameElements.obstacles.instances;

		for ( let i = 0; i < obstacles.length; i ++ ) {

			let obstacle = obstacles[ i ];

			if ( this.isInBox ( obstacle, player.position ) ) {

				this.resetPlayer ();
				break;

			}

		}

		// Compute te electric force
		// F = k * ( q1 * q2 ) / r^2
		// F = q * E
		// E = k * Q / r * r

		let forceResult = vec3.create();

		// Fixed charges

		let fixedCharges = this.gameElements.fixedCharges.instances;

		for ( let i = 0; i < fixedCharges.length; i ++ ) {

			let charge = fixedCharges[ i ];
			let dist = vec3.length ( vec3.sub ( vec3.create(), charge.position, player.position ) );

			if ( dist < charge.radius ) {

				this.resetPlayer ();

			} else {

				let force = this.computeElectricForce ( charge, player );
				vec3.add ( forceResult, forceResult, force );

			}

		}

		// Charges

		let chargesUniform = [];
		let charges = this.gameElements.charges.instances;

		for ( let i = 0; i < charges.length; i ++ ) {

			let charge = charges[ i ];

			chargesUniform.push ( charge.position[ 0 ] );
			chargesUniform.push ( charge.position[ 1 ] );
			chargesUniform.push ( Math.abs ( charge.charge / charge.maxCharge ) * charge.sign );

			let dist = vec3.length ( vec3.sub ( vec3.create(), charge.position, player.position ) );

			if ( dist < charge.radius ) {

				this.resetPlayer ();

			} else {

				let force = this.computeElectricForce ( charge, player );
				vec3.add ( forceResult, forceResult, force );

			}

		}

		if ( chargesUniform.length > 0 ) {

			this.scanMaterial.uniforms.numCharges.value = chargesUniform.length / 3;
			this.scanMaterial.uniforms.charges.value = chargesUniform;

		}

		player.applyForce ( forceResult );

		// Update the particles emitted by the player.

		let playerParticles = this.gameElements.playerParticles.instances;

		for ( let j = 0; j < playerParticles.length; j ++ ) {

			let particle = playerParticles[ j ];

			let dir = vec3.sub ( vec3.create (), player.position, particle.position );
			let dist = vec3.length ( dir );

			vec3.normalize ( dir, dir );
			vec3.scale ( dir, dir, ( 1 / Math.pow ( dist + 1.0, 2 ) ) * 2 );

			particle.applyForce ( dir );

			for ( let i= 0; i < charges.length; i ++ ) {

				let charge = charges[ i ];

				let dir = vec3.sub ( vec3.create (), charge.position, particle.position );
				let minDist = charge.scale[ 0 ] + particle.scale[ 0 ];
				let dist = vec3.length ( dir );

				if ( dist < minDist ) {

					vec3.scale ( dir, dir, - ( minDist - dist ) * 100 );
					particle.applyForce ( dir );

				} else {

					let force = this.computeElectricForce ( charge, particle );
					particle.applyForce ( vec3.scale ( force, force, 0.5 ) );

				}

			}

		}

		// Update FX particles

		for ( let i = 0; i < 2; i ++ ) {

			let instance = this.addInstanceOf ( 'playerParticles', {

				enabled: Math.random () > 0.05 ? true : false,
				position: vec3.clone ( player.position ),
				canDye: true,
				lifeSpan: Math.random () * 1000 + 1000,
				drag: 0.95,
				mass: Math.random () * 100 + 200,
				initialRadius: Math.random () * 0.06 + 0.03,
				velocity: vec3.scale ( vec3.create (), vec3.clone ( player.velocity ), 0.1 ),

			} );

			instance.applyForce ( vec3.fromValues ( ( Math.random () - 0.5 ) * 30, ( Math.random () - 0.5 ) * 30, ( Math.random () - 0.5 ) * 30 ) );

		}

	}

	checkCharges ( _position ) {

		let charges = this.gameElements.charges.instances;

		for ( let i = 0; i < charges.length; i ++ ) {

			let rangeCenter = charges[ i ].radius * 0.5;
			let distToCenter = vec3.length ( vec3.sub ( vec3.create(), charges[ i ].position, _position ) );

			let rangeEdge = 0.1;
			let distToEdge = Math.abs ( distToCenter - charges[ i ].radius );

			if ( distToEdge < rangeEdge ) {

				let tC = charges[ i ];
				this.gameElements.charges.instances.splice ( i, 1 );
				this.gameElements.charges.instances.unshift ( tC );

				return {

					element: this.gameElements.charges.instances[ 0 ],
					type: 'edge',

				}

			} else if ( distToEdge > rangeEdge && distToCenter < charges[ i ].radius ) {

				let tC = charges[ i ];
				this.gameElements.charges.instances.splice ( i, 1 );
				this.gameElements.charges.instances.unshift ( tC );

				return {

					element: this.gameElements.charges.instances[ 0 ],
					type: 'center',

				};

			}

		}

		return null;

	}

	computeElectricForce ( _e1, _e2 ) {

		let k = 8.99 * Math.pow ( 10, 1.5 ); // Here we tweak a little bit the real values.
		let dir = vec3.sub ( vec3.create(), _e1.position, _e2.position );
		let dist = vec3.length ( dir );

		vec3.normalize ( dir, dir );
		let mag = k * ( _e1.charge * _e2.charge ) / Math.pow ( dist, 2 );

		return vec3.scale ( dir, dir, mag );

	}

	resetPlayer () {

		this.gameElements.player.instances[ 0 ].position = vec3.fromValues ( 0, this.getWorldTop () * 1.03, 0 );
		this.gameElements.player.instances[ 0 ].velocity = vec3.create();
		this.gameElements.player.instances[ 0 ].applyForce ( [ ( Math.random () - 0.5 ) * 1, -5, 0 ] ); 

	}

	reloadLevel () {

		let charges = this.gameElements.charges.instances;

		for ( let i = charges.length - 1; i >= 0; i -- ) {

			charges[ i ].kill ();

		}

	}

}
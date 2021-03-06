import { clamp } from '../utils';
import { shaderHelper } from './shaderHelper';
import { LevelCore } from "./LevelCore";
import { Text } from "./Text";

export class GravityElectricLevel extends LevelCore {

	constructor ( _options ) {

		try {

			super ( _options );
			this.build ();
			
		} catch ( e ) {

			console.error ( e );

		}

		this.activePlanet = null;
		this.canUpdateTexts = true;

		this.won = false;

	}

	build () {

		super.build ();

		// Build the scan background.
		// Electric Potential of the planets
		let maxScale = this.getWorldRight () > this.getWorldTop () ? this.getWorldRight () * 2 : this.getWorldTop () * 2;
		let scanElectricGeometry = new THREE.PlaneGeometry ( 1, 1, 100, 100 );
		this.scanElectricMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.equipotentialLines.vertex,
			fragmentShader: shaderHelper.equipotentialLines.fragment,

			uniforms: {

				numCharges: { value: 0 },
				charges: { value: [ 0, 0, 0 ] },

			},

			transparent: true,

		} );

		this.scanElectric = new THREE.Mesh ( scanElectricGeometry, this.scanElectricMaterial );
		this.scanElectric.scale.set ( maxScale, maxScale, 1.0 );
		this.scanScene.add ( this.scanElectric );
		this.scanElectricMaterial.extensions.derivatives = true;

		// Gravity bending

		this.scanGravityMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.grid.vertex,
			fragmentShader: shaderHelper.grid.fragment,

			uniforms: {

				gridSubdivisions: { value: 60 },
				mainAlpha: { value: 0.5 },
				numMasses: { value: 0 },
				masses: { value: [ 0, 0, 0 ] },

			},

			transparent: true,

		} );

		this.scanGravity = new THREE.Mesh ( scanElectricGeometry, this.scanGravityMaterial );
		this.scanGravity.scale.set ( maxScale * 1.4, maxScale * 1.4, 1.0 );
		this.scanScene.add ( this.scanGravity );
		this.scanGravityMaterial.extensions.derivatives = true;

		this.mouseDown = false;

	}

	onUp ( _position ) {

		super.onUp ( _position );
		this.activePlanet = null;

		this.indicatorScaleTarget = 0.0;
		this.indicatorAlphaTarget = 0.0;

		let totalCharges = this.gameElements.planets.instances;

		for ( let i = 0; i < totalCharges.length; i ++ ) {

			let isBoundToTouch = false;

			for ( let touch in this.glWorldTouches ) {

				if ( totalCharges[ i ].touchId == this.glWorldTouches[ touch ].id ) {

					isBoundToTouch = true;

				}

			}

			if ( !isBoundToTouch ) {

				totalCharges[ i ].touchId = -1; // Nobody has -1 fingers I guess.

			}

		}

		this.mouseDown = false;

	} 

	onDown ( _position ) {

		super.onDown ( _position );

		let planets = this.gameElements.planets.instances;

		if ( this.activeScreensBoundToTouch.length == 0 ) {

			for ( let touch in this.glWorldTouches ) {

				for ( let i = 0; i < planets.length; i ++ ) {

					let dist = vec3.length ( vec3.sub ( [ 0, 0, 0 ], planets[ i ].position, this.glWorldTouches[ touch ].position ) );

					if ( dist < planets[ i ].scale[ 0 ] ) {

						planets[ i ].touchId = this.glWorldTouches[ touch ].id;

					}

				}

			}

		}

		this.mouseDown = true;

	}

	onClick ( _position ) {

		super.onClick ( _position );


	}

	onMove ( _position ) {

		super.onMove ( _position );

	} 

	onDrag ( _position ) {

		super.onDrag ( _position );

		let planets = this.gameElements.planets.instances;

		if ( this.activeScreensBoundToTouch.length == 0 ) {

			for ( let touch in this.glWorldTouches ) {

				for ( let i = 0; i < planets.length; i ++ ) {

					if ( planets[ i ].touchId == this.glWorldTouches[ touch ].id ) {

						let maxDist = planets[ i ].scale[ 0 ] * 1.5;
						let yDist = this.glWorldTouches[ touch ].position[ 1 ] - planets[ i ].position[ 1 ];
						let percentDist = clamp ( yDist / maxDist, -1, 1 );

						planets[ i ].targetCharge = planets[ i ].maxCharge * percentDist;

					}

				}

			}

		}

	}

	update () {

		// Check if all is loaded.

		if ( !this.ready ) {

			if ( Object.keys( this.gameElements ).length == this.elementToLoad ) {

				this.ready = true;
				this.gameElements.player.instances[ 0 ].mass = 1000000;
				this.gameElements.player.instances[ 0 ].enabled = true;
				this.resetPlayer ();
				// this.start = this.getInstanceByName ( 'goals', 'bottom' );
				// this.arrival = this.getInstanceByName ( 'goals', 'top' );
				this.arrivedInGame = false;
				this.buildCharges ();

			} else {

				return;

			}

		}

		if ( !this.won && this.levelCompleted ) {

			if ( this.onWinCallback ) this.onWinCallback ( this.levelFile );
			this.won = true;

		}

		super.update ();

		// this.indicatorObj.scale.y += ( this.indicatorScaleTarget - this.indicatorObj.scale.y ) * 0.2;
		// this.indicatorObj.rotation.z += ( this.indicatorAngleTarget - this.indicatorObj.rotation.z ) * 0.2;
		// this.indicatorMaterial.uniforms.alpha.value += ( this.indicatorAlphaTarget - this.indicatorMaterial.uniforms.alpha.value ) * 0.1;

		// main player

		let player = this.gameElements.player.instances[ 0 ];
		if ( this.checkEdges ( player.position, 0.2 ) && !this.levelCompleted ) this.resetPlayer ();
		// if ( this.isInBox ( this.arrival, player.position ) ) this.onWinCallback ();
		// if ( this.isInBox ( this.start, player.position ) ) this.arrivedInGame = true;

		// Compute the physics behind.
		// Here we take two different équations to compute the forces.

		let resultForce = vec3.create ();

		let chargesUniform = [];
		let massesUniforms = [];
		let planets = this.gameElements.planets.instances;

		for ( let i = 0; i < planets.length; i ++ ) {

			// Update the uniforms passed to the scan vertex shader.

			chargesUniform.push ( planets[ i ].position[ 0 ] );
			chargesUniform.push ( planets[ i ].position[ 1 ] );
			chargesUniform.push ( Math.abs ( planets[ i ].charge / planets[ i ].maxCharge ) * planets[ i ].sign );

			massesUniforms.push ( planets[ i ].position[ 0 ] );
			massesUniforms.push ( planets[ i ].position[ 1 ] );
			massesUniforms.push ( 3.0 );
			
			// Put this after uniform update to prevent glitches.

			let dist = vec3.length ( vec3.sub ( vec3.create (), planets[ i ].position, player.position ) );

			if ( dist < planets[ i ].scale[ 0 ] ) {

				this.resetPlayer ();

			}

			let gravityForce = this.computeGravityForce ( planets[ i ], player );
			vec3.add ( resultForce, resultForce, gravityForce );
			let electricForce = this.computeElectricForce ( planets[ i ], player );
			vec3.add ( resultForce, resultForce, electricForce );

			// Update the charges inside it.

			let charges = planets[ i ].charges;

			for ( let j = 0; j < charges.length; j ++ ) {

				if ( this.mouseDown ) {

					let dir = vec3.sub ( vec3.create (), charges[ j ].position, this.glMouseWorld );
					let dist = vec3.length ( dir );
					let maxDist = 2.0;
					vec3.normalize ( dir, dir );
					let amp = clamp ( dist / maxDist , 0, 1 );

					if ( dist < 0.5 ) {

						charges[ j ].applyForce ( vec3.scale ( dir, dir, amp * 3 ) );

					}

				}

				for ( let k = 0; k < charges.length; k ++ ) {

					if ( j != k ) {

						let dir = vec3.sub ( vec3.create (), charges[ k ].position, charges[ j ].position );
						let dist = vec3.length ( dir );
						vec3.normalize ( dir, dir );

						let offset = 0.23;
						let minDist = charges[ k ].scale[ 0 ] + charges[ j ].scale[ 0 ] + offset;

						if ( dist < minDist ) {

							vec3.scale ( dir, dir, - Math.pow ( minDist - dist, 3 ) * 120 );
							charges[ j ].applyForce ( dir );	

						} else {

							vec3.scale ( dir, dir, ( 1.0 / Math.pow( dist + 1.0, 2 ) ) * 0.1 );
							charges[ j ].applyForce ( dir );
							
						}

					}

				}

			}

		}

		// Change the uniform's values.

		if ( chargesUniform.length > 0 ) {

			this.scanElectricMaterial.uniforms.numCharges.value = chargesUniform.length / 3;
			this.scanElectricMaterial.uniforms.charges.value = chargesUniform;

		}

		if ( massesUniforms.length > 0 ) {

			this.scanGravityMaterial.uniforms.numMasses.value = massesUniforms.length / 3;
			this.scanGravityMaterial.uniforms.masses.value = massesUniforms;

		}

		// Update the player according to the resulting of all forces merged together.

		if ( !this.levelCompleted ) player.applyForce ( resultForce );

		// Update particles emitted by the player.

		let playerParticles = this.gameElements.playerParticles.instances;

		for ( let j = 0; j < playerParticles.length; j ++ ) {

			let particle = playerParticles[ j ];

			let dir = vec3.sub ( vec3.create (), player.position, particle.position );
			let dist = vec3.length ( dir );

			vec3.normalize ( dir, dir );
			vec3.scale ( dir, dir, ( 1 / Math.pow ( dist + 1.0, 2 ) ) * 2 );

			particle.applyForce ( dir );

		}

		// Obstacles

		if ( this.gameElements.obstacles ) {

			let obstacles = this.gameElements.obstacles.instances || [];

			for ( let i = 0; i < obstacles.length; i ++ ) {

				let obstacle = obstacles[ i ];

				if ( this.isInBox ( obstacle, player.position ) ) {

					this.resetPlayer ();
					break;

				}

			}

		}

		// Update FX particles

		// for ( let i = 0; i < 2; i ++ ) {

		// 	let instance = this.addInstanceOf ( 'playerParticles', {

		// 		enabled: Math.random () > 0.05 ? true : false,
		// 		position: vec3.clone ( player.position ),
		// 		canDye: true,
		// 		lifeSpan: Math.random () * 1000 + 1000,
		// 		drag: 0.95,
		// 		mass: Math.random () * 100 + 200,
		// 		initialRadius: Math.random () * 0.06 + 0.03,
		// 		velocity: vec3.scale ( vec3.create (), vec3.clone ( player.velocity ), 0.1 ),

		// 	} );

		// 	instance.applyForce ( vec3.fromValues ( ( Math.random () - 0.5 ) * 30, ( Math.random () - 0.5 ) * 30, ( Math.random () - 0.5 ) * 30 ) );

		// }

		if ( !this.infoScreenOpened ) return;

		if ( this.canUpdateTexts ) {

			this.canUpdateTexts = false;
			this.updateTexts ();
			setTimeout ( function () {

				this.canUpdateTexts = true;

			}.bind ( this ), 5 );

		}

	}

	updateTexts () {

		if ( !this.textsGeometry ) return;

		let player = this.gameElements.player.instances[ 0 ];
		let points = this.gameElements.planets.textPoints;

		let indices = [];
		let positions = [];
		let uvs = [];

		let modelMatrix = mat4.create ();

		let planetPoints = this.gameElements.planets.textPoints;

		for ( let pp in planetPoints ) {

			let point = planetPoints[ pp ].point;
			let instances = planetPoints[ pp ].instances;

			let totalForce = 0;
			let totalMass = 0;

			for ( let i = 0; i < instances.length; i ++ ) {

				totalForce += vec3.length ( this.computeGravityForce ( instances[ i ], player ) );
				totalMass += instances[ i ].mass;

			}


			let textData = this.textsGeometry.getTextData ( totalMass + ' kg\n' + ( Math.floor ( totalForce * 100 ) / 100 ) + ' N' );
			
			mat4.identity ( modelMatrix );
			mat4.translate ( modelMatrix, modelMatrix, [ point[ 0 ] - textData.width * 0.0025 * 0.5, -point[ 1 ] + 0.1 + textData.height * 0.0025, 0 ] );
			mat4.scale ( modelMatrix, modelMatrix, vec3.fromValues ( 0.0025, 0.0025, 0.0025 ) );

			for ( let j = 0; j < textData.indices.length; j ++ ) {

				indices.push ( textData.indices[ j ] + positions.length / 2 );

			}

			for ( let j = 0; j < textData.positions.length; j += 2 ) {

				let v = [ textData.positions[ j + 0 ], textData.positions[ j + 1 ], 0 ];
				vec3.transformMat4 ( v, v, modelMatrix );

				positions.push ( v[ 0 ] );
				positions.push ( v[ 1 ] );

			}

			for ( let j = 0; j < textData.uvs.length; j ++ ) {

				uvs.push ( textData.uvs[ j ]);

			}

		}

		if ( positions.length > 0 ) {

			this.dynamicBuffer.index ( this.textsGeometry, indices, 1 );
			this.dynamicBuffer.attr ( this.textsGeometry, 'position', positions, 2 );
			this.dynamicBuffer.attr ( this.textsGeometry, 'uv', uvs, 2);

		} else {

			let textData = this.textsGeometry.getTextData ( '' );

			this.dynamicBuffer.index ( this.textsGeometry, textData.indices, 1 );
			this.dynamicBuffer.attr ( this.textsGeometry, 'position', textData.positions, 2 );
			this.dynamicBuffer.attr ( this.textsGeometry, 'uv', textData.uvs, 2);

		}

	}

	// Build the charges contained in the planets.

	buildCharges () {

		let planets = this.gameElements.planets.instances;

		for ( let i = 0; i < planets.length; i ++ ) {

			let planet = planets[ i ];
			let layers = planet.particles;

			for ( let j = 0; j < layers.length; j ++ ) {

				for ( let k = 0; k < layers[ j ]; k ++ ) {

					let step = ( Math.PI * 2.0 ) / layers[ j ];
					let angle = step * k;// + ( Math.random() - 0.5 ) * 0.2;
					let dist = ( ( planet.scale[ 0 ] * 0.50 ) / ( layers.length - 1 ) ) * j;

					let rSize = Math.random() * 0.05 + 0.12;

					let color = null;

					if ( Math.random() > 0.5 ) {

						color = vec4.fromValues ( 50/255, 104/255, 252/255, 1.0 );

					} else {

						color = vec4.fromValues ( 252/255, 74/255, 50/255, 1.0 );

					}

					// Store the charges in the planet to have an easy access.

					planets[ i ].charges.push (

						this.addInstanceOf ( 'charges', {

							name: 'gravityChargeParticle',
							position: vec3.fromValues ( planet.position[ 0 ] + Math.cos ( angle ) * dist, planet.position[ 1 ] + Math.sin ( angle ) * dist, 0.0 ),
							rotation: [ 0, 0, Math.random () * Math.PI * 2 ],
							minRadius: 0.1,
							maxRadius: 0.5,
							radius: ( j == 0 ) ? 0.2 : 0.05,
							targetRadius: ( j == 0 ) ? 0.2 : Math.random () * 0.1 + 0.1,
							mass: 400,
							drag: 0.9,
							enabled: ( j == 0 ) ? false : true, // disable the first instance to keep it in the center.

					} ) );

				}

			}

		}

	}

	// Compute natural forces according to some basic equations.

	computeElectricForce ( _e1, _e2 ) {

		let k = 8.99 * Math.pow ( 10, 1.5 ); // Here we tweak a little bit the real values.
		let dir = vec3.sub ( vec3.create(), _e1.position, _e2.position );
		let dist = vec3.length ( dir );

		vec3.normalize ( dir, dir );
		let mag = k * ( _e1.charge * _e1.sign * _e2.charge * _e2.sign ) / Math.pow ( dist, 2 );

		return vec3.scale ( dir, dir, mag );

	}

	computeGravityForce ( _e1, _e2 ) {

		let G = 6.674 * Math.pow ( 10, -9 ); // Here we tweak a little bit the real values.
		let dir = vec3.sub ( vec3.create(), _e1.position, _e2.position );
		let dist = vec3.length ( dir );

		vec3.normalize ( dir, dir );
		let mag = G * ( _e1.mass * _e2.mass ) / Math.pow ( dist, 2 );

		return vec3.scale ( dir, dir, mag );

	}

	// Interactions

	checkPlanets ( _vector ) {

		let planets = this.gameElements.planets.instances;

		for ( let i = 0; i < planets.length; i ++ ) {

			let dist = vec3.length ( vec3.sub ( vec3.create (), planets[ i ].position, _vector ) );

			if ( dist < planets[ i ].scale[ 0 ] ) {

				return planets[ i ];

			}

		}

		return null;

	}

	resetPlayer () {

		this.explosionSound ();
		this.gameElements.player.instances[ 0 ].position = vec3.fromValues ( 0, this.getWorldBottom () - 0.1, 0 );
		this.gameElements.player.instances[ 0 ].velocity = vec3.create();
		this.gameElements.player.instances[ 0 ].applyForce ( [ 0, 10000, 0 ] ); 

	}

	reloadLevel () {

		this.resetPlayer ();
		let planets = this.gameElements.planets.instances;

		for ( let i = 0; i < planets.length; i ++ ) {

			planets[ i ].charge = 0;
			planets[ i ].targetCharge = 0;

		}

	}

}
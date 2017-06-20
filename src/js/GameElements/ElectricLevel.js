import { contains } from "../utils";
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
		this.activeChargesBoundToTouches = null;
		this.mouseOnDown = null;

		// Build scan background

		let maxScale = this.getWorldRight () > this.getWorldTop () ? this.getWorldRight () * 2 : this.getWorldTop () * 2;
		this.scanGeometry = new THREE.PlaneGeometry ( 1, 1, 150, 150 );
		this.scanMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.equipotentialLines.vertex,
			fragmentShader: shaderHelper.equipotentialLines.fragment,
			transparent: true,

			uniforms: {


				numCharges: { value: 0 },
				charges: { value: [ 0, 0, 0 ] },

			},

		} );

		this.scanMesh = new THREE.Mesh ( this.scanGeometry, this.scanMaterial );
		this.scanMesh.renderOrder = 0;
		this.scanMesh.scale.set ( maxScale, maxScale, 1.0 );
		this.scanScene.add ( this.scanMesh );
		this.scanMaterial.extensions.derivatives = true;

		// Multitouch

		this.createdInstances = [];
		this.downTouchIds = [];

		this.canUpdateTexts = true;
		this.won = false;

	}

	build () {

		super.build ();

		this.onLoad ( function () {

			this.gameElements.arrival.instances[ 0 ].position[ 1 ] = this.getWorldBottom () + 0.5;

		}.bind ( this ) );

	}

	onUp ( _positions ) {

		super.onUp ( _positions );

		this.downTouchIds = [];

		let totalCharges = this.getTotalCharges ();

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

		for ( let touch in this.glWorldTouches ) {

			this.downTouchIds.push ( this.glWorldTouches[ touch ].id );

		}

	} 

	onDown ( _positions ) {

		super.onDown ( _positions );

		if ( this.activeScreensBoundToTouch.length == 0 ) {

			// If no charges are touched

			let totalCharges = this.getTotalCharges ();

			for ( let touch in this.glWorldTouches ) {

				if ( !contains.call ( this.downTouchIds, this.glWorldTouches[ touch ].id ) ) { // check if that touch is already down.

					let currentTouch = this.glWorldTouches[ touch ];

					let hoverCharge = null;

					for ( let i = 0; i < totalCharges.length; i ++ ) {

						let dist = vec3.length ( vec3.sub ( [ 0, 0, 0 ], currentTouch.position, totalCharges[ i ].position ) );
						let offsetEdge = 0.2;

						if ( dist < totalCharges[ i ].scale[ 0 ] + offsetEdge ) {

							hoverCharge = totalCharges[ i ];
							hoverCharge.touchId = this.glWorldTouches[ touch ].id;

							if ( dist < totalCharges[ i ].scale[ 0 ] * 0.5 ) {

								hoverCharge.touchType = 'center';

							} else {

								hoverCharge.touchType = 'edge';

							}

							break;

						}

					}

					if ( !hoverCharge ) {

						this.addInstanceOf ( 'charges', {

							position: this.glWorldTouches[ touch ].position,
							color: [ 0.0, 0.0, 0.0, 1.0 ],
							rotation: [ 0, 0, Math.random () * Math.PI * 2 ],
							mass: 15,
							drag: 0.85,
							enabled: true,
							touchId: this.glWorldTouches[ touch ].id,
							touchType: 'edge',

						} );

					}

					this.downTouchIds.push ( this.glWorldTouches[ touch ].id );

				}

			}

		}

	}

	onClick ( _positions ) {

		super.onClick ( _positions );

	}

	onMove ( _positions ) {

		super.onMove ( _positions );

	} 

	onDrag ( _positions ) {

		super.onDrag ( _positions );

	}

	onResize () {

		super.onResize ();

		let maxScale = this.getWorldRight () > this.getWorldTop () ? this.getWorldRight () * 2 : this.getWorldTop () * 2;
		this.scanMesh.scale.set ( maxScale, maxScale, 1.0 );

	}

	update () {

		// Check if all is loaded.

		if ( !this.ready ) {

			if ( Object.keys( this.gameElements ).length == this.elementToLoad ) {

				this.updateRenderer ();
				this.ready = true;
				// this.start = this.getInstanceByName ( 'goals', 'top' );
				// this.arrival = this.getInstanceByName ( 'goals', 'bottom' );
				this.arrivedInGame = false;
				this.gameElements.player.instances[ 0 ].mass = 400;
				this.gameElements.player.instances[ 0 ].enabled = true;
				this.resetPlayer ();

			} else {

				return;

			}

		}

		super.update ();

		if ( !this.won && this.levelCompleted ) {

			if ( this.onWinCallback ) this.onWinCallback ( this.levelFile );
			this.won = true;

		}

		if ( this.levelCompleted ) {

			let charges = this.gameElements.charges.instances;
			let fixedCharges = this.gameElements.fixedCharges.instances;

			for ( let i = 0; i < charges.length; i ++ ) {

				charges[ i ].kill ();

			}

			for ( let i = 0; i < fixedCharges.length; i ++ ) {

				fixedCharges[ i ].kill ();

			}

			// return;

		}

		// main player

		let player = this.gameElements.player.instances[ 0 ];
		if ( this.checkEdges ( player.position, 0.2 ) && !this.levelCompleted ) this.resetPlayer ();

		// Obstacles

		let obstacles = this.gameElements.obstacles.instances;

		for ( let i = 0; i < obstacles.length; i ++ ) {

			let obstacle = obstacles[ i ];

			if ( this.isInBox ( obstacle, player.position ) ) {

				if ( !this.levelCompleted ) this.resetPlayer ();
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
		let chargesUniform = [];

		for ( let i = 0; i < fixedCharges.length; i ++ ) {

			let charge = fixedCharges[ i ];

			chargesUniform.push ( charge.position[ 0 ] );
			chargesUniform.push ( charge.position[ 1 ] );
			chargesUniform.push ( Math.abs ( charge.charge / charge.maxCharge ) * charge.sign );

			let dist = vec3.length ( vec3.sub ( vec3.create(), charge.position, player.position ) );

			if ( dist < charge.radius ) {

				if ( !this.levelCompleted ) this.resetPlayer ();

			} else {

				let force = this.computeElectricForce ( charge, player );
				vec3.add ( forceResult, forceResult, force );

			}

		}

		// Charges

		// Update current charge

		let totalCharges = this.getTotalCharges ();

		for ( let touch in this.glWorldTouches ) {

			for ( let i = 0; i < totalCharges.length; i ++ ) {

				if ( totalCharges[ i ].touchId == this.glWorldTouches[ touch ].id && totalCharges[ i ].enabled ) {
					
					let force = vec3.sub ( [ 0, 0, 0 ], this.glWorldTouches[ touch ].position, totalCharges[ i ].position );
					let yDist = Math.sign ( this.glWorldTouches[ touch ].position[ 1 ] - totalCharges[ i ].position[ 1 ] );

					if ( totalCharges[ i ].touchType == 'center' ) {

						totalCharges[ i ].applyForce ( vec3.scale ( force, force, 0.8 ) );

					} else if ( totalCharges[ i ].touchType == 'edge' ) {

						totalCharges[ i ].targetRadius = vec3.length ( force );
						totalCharges[ i ].sign = yDist;

					}

				}

			}

		}

		let charges = this.gameElements.charges.instances;

		for ( let i = 0; i < charges.length; i ++ ) {

			let charge = charges[ i ];

			if ( this.checkEdges ( charge.position, 0.2 ) ) {

				charge.update ();
				if ( !charge.killed ) {

					charge.kill ();
					
				}

			}

			chargesUniform.push ( charge.position[ 0 ] );
			chargesUniform.push ( charge.position[ 1 ] );
			chargesUniform.push ( Math.abs ( charge.charge / charge.maxCharge ) * charge.sign );

			let dist = vec3.length ( vec3.sub ( vec3.create(), charge.position, player.position ) );

			if ( dist < charge.radius ) {

				if ( !this.levelCompleted ) this.resetPlayer ();

			} else {

				let force = this.computeElectricForce ( charge, player );
				vec3.add ( forceResult, forceResult, force );

			}

			// Check overlapping charges.

			for ( let j = 0; j < charges.length; j ++ ) {

				if ( j != i ) {

					let dir = vec3.sub ( vec3.create (), charge.position, charges[ j ].position );
					let dist = vec3.length ( dir );
					let minDist = charge.scale[ 0 ] + charges[ j ].scale[ 0 ];
					let offset = -0.15;

					if ( dist < minDist + offset ) {

						vec3.scale ( dir, dir, Math.pow ( minDist - dist, 3 ) * 5 );
						charge.applyForce ( dir );

					}

				}

			}

			for ( let j = 0; j < fixedCharges.length; j ++ ) {

				let dir = vec3.sub ( vec3.create (), charge.position, fixedCharges[ j ].position );
				let dist = vec3.length ( dir );
				let minDist = charge.scale[ 0 ] + fixedCharges[ j ].scale[ 0 ];
				let offset = -0.07;

				if ( dist < minDist + offset ) {

					vec3.scale ( dir, dir, Math.pow ( minDist - dist, 2 ) * 5 );
					charge.applyForce ( dir );

				}

			}

		}

		if ( chargesUniform.length > 0 ) {

			this.scanMaterial.uniforms.numCharges.value = chargesUniform.length / 3;
			this.scanMaterial.uniforms.charges.value = chargesUniform;

		}

		if ( !this.levelCompleted ) player.applyForce ( forceResult );

		// Update the particles emitted by the player.

		let playerParticles = this.gameElements.playerParticles.instances;

		for ( let j = 0; j < playerParticles.length; j ++ ) {

			let particle = playerParticles[ j ];

			let dir = vec3.sub ( vec3.create (), player.position, particle.position );
			let dist = vec3.length ( dir );

			vec3.normalize ( dir, dir );
			vec3.scale ( dir, dir, ( 1 / Math.pow ( dist + 1.0, 2 ) ) * 2 );

			particle.applyForce ( dir );

			for ( let i = 0; i < charges.length; i ++ ) {

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

		// Update texts

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
		let points = this.gameElements.charges.textPoints;

		let indices = [];
		let positions = [];
		let uvs = [];

		let modelMatrix = mat4.create ();

		let fixedChargesPoints = this.gameElements.fixedCharges.textPoints;

		for ( let pp in fixedChargesPoints ) {

			let point = fixedChargesPoints[ pp ].point;
			let instances = fixedChargesPoints[ pp ].instances;

			let totalForce = 0;
			let totalMass = 0;
			let hack = false;

			for ( let i = 0; i < instances.length; i ++ ) {

				totalForce += vec3.length ( this.computeElectricForce ( instances[ i ], player ) );
				totalMass += instances[ i ].mass;

				if ( instances[ i ].hack ) hack = true;

			}


			let textData = this.textsGeometry.getTextData ( totalMass + ' kg\n' + ( Math.floor ( totalForce * 100 ) / 100 ) + ' N' );
			
			mat4.identity ( modelMatrix );
			mat4.translate ( modelMatrix, modelMatrix, [ point[ 0 ] - textData.width * 0.0025 * 0.5, -point[ 1 ] + 0.1 + textData.height * 0.0025, 0 ] );
			mat4.scale ( modelMatrix, modelMatrix, vec3.fromValues ( 0.0025, 0.0025, 0.0025 ) );

			if ( !hack ) {

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

		}

		for ( let p in points ) {

			let point = points[ p ].point;
			let instances = points[ p ].instances;

			let totalForce = 0;
			let totalMass = 0;

			for ( let i = 0; i < instances.length; i ++ ) {

				totalForce += vec3.length ( this.computeElectricForce ( instances[ i ], player ) );
				totalMass += instances[ i ].mass;

			}


			let textData = this.textsGeometry.getTextData ( Math.floor ( totalMass ) + ' kg\n' + ( Math.floor ( totalForce * 100 ) / 100 ) + ' N' );
			
			mat4.identity ( modelMatrix );
			mat4.translate ( modelMatrix, modelMatrix, [ point[ 0 ] - textData.width * 0.0025 * 0.5, -point[ 1 ] - 0.1, 0 ] );
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

	getBoundChargesToTouches ( _worldTouches ) {

		let boundChargesToTouches = [];

		let totalCharges = [];
		let charges = this.gameElements.charges.instances;
		let fixedCharges = this.gameElements.fixedCharges.instances;
		totalCharges = totalCharges.concat ( charges );
		totalCharges = totalCharges.concat ( fixedCharges );

		for ( let j = 0; j < _worldTouches; j ++ ) {

			let currentGlTouch = _worldTouches[ j ];

			for ( let i = 0; i < totalCharges.length; i ++ ) {

				let currentCharge = totalCharges[ i ];
				let dist = vec3.length ( vec3.sub ( [ 0, 0, 0 ], currentCharge.position, currentGlTouch ) );
				let edgeOffset = 0.3;

				if ( dist < currentCharge.scale[ 0 ] + edgeOffset ) {

					boundChargesToTouches.push ( { charge: currentCharge, touchId: j } );

				}

			}

		}

		return boundChargesToTouches;

	}

	checkCharges ( _positions ) {

		let totalCharges = [];
		let charges = this.gameElements.charges.instances;
		let fixedCharges = this.gameElements.fixedCharges.instances;

		totalCharges = totalCharges.concat ( charges );
		totalCharges = totalCharges.concat ( fixedCharges );

		for ( let i = 0; i < totalCharges.length; i ++ ) {

			let rangeCenter = totalCharges[ i ].radius * 0.5;
			let distToCenter = vec3.length ( vec3.sub ( vec3.create(), totalCharges[ i ].position, _positions ) );

			let rangeEdge = 0.2;
			let distToEdge = Math.abs ( distToCenter - totalCharges[ i ].radius );

			if ( distToEdge < rangeEdge ) {

				let tC = totalCharges[ i ];

				return {

					element: tC,
					type: 'edge',

				}

			} else if ( distToEdge > rangeEdge && distToCenter < totalCharges[ i ].radius ) {

				let tC = totalCharges[ i ];

				return {

					element: tC,
					type: 'center',

				};

			}

		}

		return null;

	}

	getTotalCharges () {

		let totalCharges = [];
		let charges = this.gameElements.charges.instances;
		let fixedCharges = this.gameElements.fixedCharges.instances;
		totalCharges = totalCharges.concat ( charges );
		totalCharges = totalCharges.concat ( fixedCharges );

		return totalCharges;

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

		this.explosionSound ();
		this.gameElements.player.instances[ 0 ].color[ 3 ] = 0;
		this.gameElements.player.instances[ 0 ].position = vec3.fromValues ( 0, this.getWorldTop () + 0.1, 0 );
		this.gameElements.player.instances[ 0 ].velocity = vec3.create();
		this.gameElements.player.instances[ 0 ].applyForce ( [ 0, -10, 0 ] ); 

	}

	reloadLevel () {

		let charges = this.gameElements.charges.instances;

		for ( let i = charges.length - 1; i >= 0; i -- ) {

			charges[ i ].kill ();

		}

	}

}
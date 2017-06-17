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

		this.canUpdateTexts = true;

	}

	build () {

		super.build ();

		this.onLoad ( function () {

			this.gameElements.arrival.instances[ 0 ].position[ 1 ] = this.getWorldBottom () + 0.5;

		}.bind ( this ) );

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

		} else if ( this.currentInstance && this.currentInstance.element.enabled ) {

			let dir = null;
			let dist = null;
			let yDist = null;

			switch ( this.currentInstance.type ) {

				case 'center':

					// this.currentInstance.element.targetPosition = mouse;
					
					// this.currentInstance.element.targetRadius = 0;

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

		// main player

		let player = this.gameElements.player.instances[ 0 ];
		if ( this.checkEdges ( player.position, 0.2 ) ) this.resetPlayer ();
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
		let chargesUniform = [];

		for ( let i = 0; i < fixedCharges.length; i ++ ) {

			let charge = fixedCharges[ i ];

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

		// Charges

		// Update current charge

		if ( this.currentInstance && this.currentInstance.type == 'center' ) {

			let dir = vec3.sub ( vec3.create (), this.glMouseWorld, this.currentInstance.element.position );
			this.currentInstance.element.applyForce ( dir );

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

				this.resetPlayer ();

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

	checkCharges ( _position ) {

		let totalCharges = [];
		let charges = this.gameElements.charges.instances;
		let fixedCharges = this.gameElements.fixedCharges.instances;

		totalCharges = totalCharges.concat ( charges );
		totalCharges = totalCharges.concat ( fixedCharges );

		for ( let i = 0; i < totalCharges.length; i ++ ) {

			let rangeCenter = totalCharges[ i ].radius * 0.5;
			let distToCenter = vec3.length ( vec3.sub ( vec3.create(), totalCharges[ i ].position, _position ) );

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

	computeElectricForce ( _e1, _e2 ) {

		let k = 8.99 * Math.pow ( 10, 1.5 ); // Here we tweak a little bit the real values.
		let dir = vec3.sub ( vec3.create(), _e1.position, _e2.position );
		let dist = vec3.length ( dir );

		vec3.normalize ( dir, dir );
		let mag = k * ( _e1.charge * _e2.charge ) / Math.pow ( dist, 2 );

		return vec3.scale ( dir, dir, mag );

	}

	resetPlayer () {

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
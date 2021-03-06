import { PhysicalElement } from "./PhysicalElement";
import { shaderHelper } from './shaderHelper';
import { LevelCore } from "./LevelCore";

export class GravityLevel extends LevelCore {

	constructor ( _options ) {

		try {

			super ( _options );
			this.build ();
			
		} catch ( e ) {

			console.error ( e );

		}

		this.ready = false;

		// build a grid

		let maxScale = this.getWorldRight () > this.getWorldTop () ? this.getWorldRight () * 2 : this.getWorldTop () * 2;
		let gridGeometry = new THREE.PlaneBufferGeometry ( 1, 1, 80, 80 );
		this.gridMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.grid.vertex,
			fragmentShader: shaderHelper.grid.fragment,
			transparent: true,

			uniforms: {

				mainAlpha: { value: 1.0 },
				gridSubdivisions: { value: 60 },
				numMasses: { value: 0 },
				masses: { value: [ 0, 0, 0 ] },

			},

			// side: THREE.DoubleSide,

		} );

		this.grid = new THREE.Mesh ( gridGeometry, this.gridMaterial );
		this.grid.scale.set ( maxScale * 1.4, maxScale * 1.4, 1 );
		this.grid.renderOrder = 0;
		this.scanScene.add ( this.grid );
		this.gridMaterial.extensions.derivatives = true;

		// Blackmatter

		this.canDraw = true;
		this.canUpdateTexts = true;

		this.won = false;

	}

	build () {

		super.build ();

		this.onLoad ( function () {

			this.render ();

		}.bind ( this ) );

	}

	onUp ( _position ) {

		super.onUp ( _position );

	} 

	onDown ( _position ) {

		super.onDown ( _position );

	}

	onClick ( _position ) {

		if ( this.levelCompleted ) return;

		super.onClick ( _position );

	}

	onMove ( _position ) {

		if ( this.levelCompleted ) return;

		super.onMove ( _position );

	} 

	onDrag ( _position ) {

		if ( this.levelCompleted ) return;

		super.onDrag ( _position );


		if ( this.activeScreensBoundToTouch.length == 0 && this.canDraw ) {

			for ( let touch in this.glWorldTouches ) {

				let r = rc();
				let s = Math.random () * 0.3 + 0.2;

				// On the iPad Air the max number of vectors we can pass to a vertex shader is 108.

				if ( this.gameElements.blackMatter.instances.length < 108 ) {

					this.addInstanceOf ( 'blackMatter', {

						position: this.glWorldTouches[ touch ].position,
						scale: [ s, s, s ],
						color: [ 0.8 + r, 0.8 + r, 0.8 + r, 1.0 ],
						rotation: [ 0, 0, Math.random () * Math.PI * 2 ],
						mass: 20000,
						drag: 0.95,
						lifeSpan: Math.random () * 4000 + 6000,
						canDye: true,
						targetLinePosition: [ -2.0, 2.0, 0.0 ],

					} );

				}

			}

		}

		if ( this.canDraw ) {

			this.canDraw = false;

			setTimeout ( function () {

				this.canDraw = true;

			}.bind ( this ), 100 );

		}

		function rc () {

			return ( Math.random () - 0.5 ) * 0.07;

		}

	}

	onResize () {

		super.onResize ();

		let maxScale = this.getWorldRight () > this.getWorldTop () ? this.getWorldRight () * 2 : this.getWorldTop () * 2;
		this.grid.scale.set ( maxScale * 1.5, maxScale * 1.5, 1.0 );

	}

	update ( _deltaTime ) {

		// Check if all is loaded.

		if ( !this.ready ) {

			if ( this.levelLoaded && this.levelStarted ) {

				this.ready = true;
				// this.start = this.getInstanceByName ( 'goals', 'bottom' );
				// this.arrival = this.getInstanceByName ( 'goals', 'top' );
				this.arrivedInGame = false;
				this.gameElements.player.instances[ 0 ].enabled = true;
				this.resetPlayer ();

			} else {

				return;

			}

		};

		super.update ( _deltaTime );

		if ( !this.won && this.levelCompleted ) {

			this.won = true;
			this.onWinCallback ( this.levelFile );

		}

		if ( this.levelCompleted ) {

			// console.log('sfélkjélkj');
			return;

		}

		// Here all the objects's geometries are updated.
		// Main player

		let player = this.gameElements.player.instances[ 0 ];
		if ( this.checkEdges ( player.position, 0.2 ) && !this.levelCompleted ) this.resetPlayer ();
		// if ( this.isInBox ( this.arrival, player.position ) ) this.onWinCallback ();
		// if ( this.isInBox ( this.start, player.position ) ) this.arrivedInGame = true;

		// Compute the gravitational field.
		//
		// G = 6.674 * 10-11 ( m3 kg-1 s-2 )
		//
		// F = G * ( m1 * m2 ) / r^2
		//

		let forceResult = vec3.create();

		// Black matter

		let massesUniforms = [];
		let blackMatterInstances = this.gameElements.blackMatter.instances;

		for ( let i = 0; i < blackMatterInstances.length; i ++ ) {

			let bC = blackMatterInstances[ i ];
			let dir = vec3.sub ( vec3.create(), bC.position, player.position );
			let dist = vec3.length ( dir );

			massesUniforms.push ( bC.position[ 0 ] );
			massesUniforms.push ( bC.position[ 1 ] );
			massesUniforms.push ( bC.mass / bC.maxMass );

			if ( dist > bC.scale[ 0 ] ) {

				let force = this.computeGravityAttraction ( bC, player );
				vec3.add ( forceResult, forceResult, force );

			} else {

				if ( !this.levelCompleted ) this.resetPlayer ();

			}

		}

		// Planets & particles

		let playerParticles = this.gameElements.playerParticles.instances;
		let planetsInstances = this.gameElements.planets.instances;

		for ( let i = 0; i < planetsInstances.length; i ++ ) {

			let planet = planetsInstances[ i ];
			let dir = vec3.sub ( vec3.create(), planet.position, player.position );
			let dist = vec3.length ( dir );

			massesUniforms.push ( planet.position[ 0 ] );
			massesUniforms.push ( planet.position[ 1 ] );
			massesUniforms.push ( (planet.mass / planet.maxMass) * 2.0 );

			if ( dist > planet.scale[ 0 ] ) {

				let force = this.computeGravityAttraction ( planet, player );
				vec3.add ( forceResult, forceResult, force );

			} else {

				if ( !this.levelCompleted ) this.resetPlayer ();

			}

			// for ( let j = 0; j < playerParticles.length; j ++ ) {

			// 	let particle = playerParticles[ j ];

			// 	let dirToPlanet = vec3.sub ( vec3.create (), planet.position, particle.position );
			// 	let distToPlanet = vec3.length ( dirToPlanet );
			// 	let minDistToPlanet = planet.scale[ 0 ] + particle.scale[ 0 ] - 0.01;
			// 	let force = null;

			// 	if ( distToPlanet < minDistToPlanet ) {

			// 		let mag = ( minDistToPlanet - distToPlanet ) * 50;
			// 		vec3.normalize ( distToPlanet, distToPlanet );
			// 		force = vec3.scale ( dirToPlanet, dirToPlanet, -mag );

			// 	} else {

			// 		force = this.computeGravityAttraction ( planet, particle );

			// 		if ( vec3.length ( force ) > 1 ) {

			// 			vec3.normalize ( force, force );
			// 			vec3.scale ( force, force, 1 );

			// 		}
					
			// 	}

			// 	particle.applyForce ( force );

			// }

		}

		// Update the grid in the scan scene.

		if ( massesUniforms.length > 0 ) {

			this.gridMaterial.uniforms.numMasses.value = massesUniforms.length / 3;
			this.gridMaterial.uniforms.masses.value = massesUniforms;
			
		}

		for ( let j = 0; j < playerParticles.length; j ++ ) {

			let particle = playerParticles[ j ];

			let dir = vec3.sub ( vec3.create (), player.position, particle.position );
			let dist = vec3.length ( dir );

			vec3.normalize ( dir, dir );
			vec3.scale ( dir, dir, ( 1 / Math.pow ( dist + 1.0, 2 ) ) * 2 );

			particle.applyForce ( dir );

		}

		player.applyForce ( forceResult );

		// Update FX particles

		for ( let i = 0; i < 1; i ++ ) {

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

		if ( !this.infoScreenOpened ) return;

		// Update text

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
		let points = this.gameElements.blackMatter.textPoints;

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

				totalForce += vec3.length ( this.computeGravityAttraction ( instances[ i ], player ) );
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

		for ( let p in points ) {

			let point = points[ p ].point;
			let instances = points[ p ].instances;

			let totalForce = 0;
			let totalMass = 0;

			for ( let i = 0; i < instances.length; i ++ ) {

				totalForce += vec3.length ( this.computeGravityAttraction ( instances[ i ], player ) );
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

	computeGravityAttraction ( _e1, _e2 ) {

		let G = 6.674 * Math.pow ( 10, -9 ); // Here we tweak a little bit the real values.
		let dir = vec3.sub ( vec3.create(), _e1.position, _e2.position );
		let dist = vec3.length ( dir );

		vec3.normalize ( dir, dir );
		let mag = G * ( _e1.mass * _e2.mass ) / Math.pow ( dist, 2 );

		return vec3.scale ( dir, dir, mag );

	}

	resetPlayer () {

		this.explosionSound ();
		this.gameElements.player.instances[ 0 ].position = vec3.fromValues ( 0, this.getWorldBottom (), 0 );
		this.gameElements.player.instances[ 0 ].velocity = vec3.create();
		this.gameElements.player.instances[ 0 ].applyForce ( [ 0, 1000, 0 ] ); 

	}

	render () {

		super.render ();

	}

}
import { PhysicalElement } from "./PhysicalElement";
import { shaderHelper } from './shaderHelper';
import { LevelCore } from "./LevelCore";
let sdfShader = require('three-bmfont-text/shaders/sdf');
let msdfShader = require('three-bmfont-text/shaders/msdf');
let bmfontGeometry = require ( 'three-bmfont-text' );
let bmfontLoader = require ( 'load-bmfont' );

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
		let gridGeometry = new THREE.PlaneBufferGeometry ( 1, 1, 200, 200 );
		this.gridMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.grid.vertex,
			fragmentShader: shaderHelper.grid.fragment,
			transparent: true,

			uniforms: {

				gridSubdivisions: { value: 80 },
				mouse: { value: [ 0, 0 ] },
				numMasses: { value: 0 },
				masses: { value: [ 0, 0, 0 ] },
				mouse: { value: [ 0, 0, 0 ] },

			},

			// side: THREE.DoubleSide,

		} );

		this.grid = new THREE.Mesh ( gridGeometry, this.gridMaterial );
		this.grid.scale.set ( maxScale * 1.5, maxScale * 1.5, 1 );
		this.scanScene.add ( this.grid );
		this.gridMaterial.extensions.derivatives = true;

		// Blackmatter

		this.canDraw = true;

		// Text

		bmfontLoader ( './resources/fonts/GT-America.fnt', function ( err, font ) {

			if ( err ) {

				console.error( err );

			} else {

				let geometry = bmfontGeometry ( {

					width: 1500,
					align: 'center',
					font: font

				} );

				geometry.update ( "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy\n-\n text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum" );

				geometry.computeBoundingBox ();

				let textureLoader = new THREE.TextureLoader ();
				textureLoader.load ( './resources/fonts/GT-America_sdf.png', function ( texture ) {

					var material = new THREE.RawShaderMaterial( sdfShader ( {
					  	
					  	map: texture,
					  	side: THREE.DoubleSide,
					  	transparent: true,
					  	color: 'rgb(0, 0, 0)',

					} ) );

					let mesh = new THREE.Mesh ( geometry, material );
					this.infoScene.add ( mesh );
					mesh.material.extensions.derivatives = true;
					geometry.computeBoundingSphere ();
					mesh.position.x -= geometry.boundingSphere.center.x * 0.003;
					mesh.position.y += geometry.boundingSphere.center.y * 0.003;
					mesh.rotation.x = Math.PI;
					mesh.scale.set ( 0.003, 0.003, 0.003 );

				}.bind ( this ) );

			} 

		}.bind ( this ) );
		
	}

	build () {

		super.build ();

	}

	onUp ( _position ) {

		super.onUp ( _position );

	} 

	onDown ( _position ) {

		super.onDown ( _position );

	}

	onClick ( _position ) {

		super.onClick ( _position );

	}

	onMove ( _position ) {

		super.onMove ( _position );

	} 

	onDrag ( _position ) {

		super.onDrag ( _position );

		if ( !this.activeScreen && this.canDraw ) {

			let r = rc();
			let s = Math.random () * 0.2 + 0.1;

			this.addInstanceOf ( 'blackMatter', {

				position: [ this.mouseWorld.x, this.mouseWorld.y, this.mouseWorld.z ],
				scale: [ s, s, s ],
				color: [ 0.8 + r, 0.8 + r, 0.8 + r, 1.0 ],
				rotation: [ 0, 0, Math.random () * Math.PI * 2 ],
				mass: 1500,
				drag: 0.95,
				lifeSpan: Math.random () * 4000 + 6000,
				canDye: true,

			} );

		}

		if ( this.canDraw ) {

			this.canDraw = false;

			setTimeout ( function () {

				this.canDraw = true;

			}.bind ( this ), 40 );

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

	update () {

		// Check if all is loaded.

		if ( !this.ready ) {

			if ( Object.keys( this.gameElements ).length == this.elementToLoad ) {

				this.ready = true;
				// this.start = this.getInstanceByName ( 'goals', 'bottom' );
				// this.arrival = this.getInstanceByName ( 'goals', 'top' );
				this.arrivedInGame = false;
				this.resetPlayer ();
				console.log(this.gameElements);

				this.lineGeometry = new THREE.BufferGeometry ();
				this.lineGeometry.addAttribute ( 'position', new THREE.BufferAttribute ( new Float32Array ( 9 ), 3 ) );
				let lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff } );
				this.lines = new THREE.Line ( this.lineGeometry, lineMaterial );
				this.mainScene.add ( this.lines );

			} else {

				return;

			}

		}

		// Here all the objects's geometries are updated.

		super.update ();

		// main player

		let player = this.gameElements.player.instances[ 0 ];
		if ( this.checkEdges ( player.position ) && this.arrivedInGame ) this.resetPlayer ();
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
			massesUniforms.push ( bC.mass );
			massesUniforms.push ( bC.maxMass );

			// console.log(bC.lifePercent);

			if ( dist > bC.scale[ 0 ] ) {

				let force = this.computeGravityAttraction ( bC, player );
				vec3.add ( forceResult, forceResult, force );

			} else {

				this.resetPlayer ();

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
			massesUniforms.push ( planet.mass );
			massesUniforms.push ( planet.maxMass );

			if ( dist > planet.scale[ 0 ] ) {

				let force = this.computeGravityAttraction ( planet, player );
				vec3.add ( forceResult, forceResult, force );

			} else {

				this.resetPlayer ();

			}

			for ( let j = 0; j < playerParticles.length; j ++ ) {

				let particle = playerParticles[ j ];

				let dirToPlanet = vec3.sub ( vec3.create (), planet.position, particle.position );
				let distToPlanet = vec3.length ( dirToPlanet );
				let minDistToPlanet = planet.scale[ 0 ] + particle.scale[ 0 ] - 0.01;
				let force = null;

				if ( distToPlanet < minDistToPlanet ) {

					let mag = ( minDistToPlanet - distToPlanet ) * 50;
					vec3.normalize ( distToPlanet, distToPlanet );
					force = vec3.scale ( dirToPlanet, dirToPlanet, -mag );

				} else {

					force = this.computeGravityAttraction ( planet, particle );

					if ( vec3.length ( force ) > 1 ) {

						vec3.normalize ( force, force );
						vec3.scale ( force, force, 1 );

					}
					
				}

				particle.applyForce ( force );

			}

		}

		// Update the grid in the scan scene.

		if ( massesUniforms.length > 0 ) {

			this.gridMaterial.uniforms.numMasses.value = massesUniforms.length / 4;
			this.gridMaterial.uniforms.masses.value = massesUniforms;
			
		}

		this.gridMaterial.uniforms.mouse.value = this.glMouseWorld;

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

	computeGravityAttraction ( _e1, _e2 ) {

		let G = 6.674 * Math.pow ( 10, -9 ); // Here we tweak a little bit the real values.
		let dir = vec3.sub ( vec3.create(), _e1.position, _e2.position );
		let dist = vec3.length ( dir );

		vec3.normalize ( dir, dir );
		let mag = G * ( _e1.mass * _e2.mass ) / Math.pow ( dist, 2 );

		return vec3.scale ( dir, dir, mag );

	}

	resetPlayer () {

		this.gameElements.player.instances[ 0 ].position = vec3.fromValues ( 0, this.getWorldBottom (), 0 );
		this.gameElements.player.instances[ 0 ].velocity = vec3.create();
		this.gameElements.player.instances[ 0 ].applyForce ( [ ( Math.random () - 0.5 ) * 500, 1000, 0 ] ); 

	}

	render () {

		super.render ();

	}

}
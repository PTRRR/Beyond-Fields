import { shaderHelper } from './GameElements/shaderHelper';
import { PhysicalElement } from './GameElements/PhysicalElement';
import { ElectricParticle } from './GameElements/ElectricParticle';
import { Planet } from './GameElements/Planet';
var SDFSHader = require('three-bmfont-text/shaders/sdf');

export class IntroScene {

	constructor ( _options ) {

		this.renderer = _options.renderer;
		this.soundManager = _options.soundManager;

		this.run = false;
		let size = this.renderer.getSize ();
		this.camera = new THREE.PerspectiveCamera ( 75, size.width / size.height, 0.1, 1000 );
		this.camera.position.z = 5;

		this.scene = new THREE.Scene ();
		this.scene.background = new THREE.Color ( 0xE6E6E6 );
		this.renderer.render ( this.scene, this.camera );

		// General

		this.quadGeometry = new THREE.PlaneBufferGeometry ( 1, 1 );

		// Step values

		this.run = false;
		this.intro = false;
		this.mainMenu = false;
		this.gravity = false;
		this.electric = false;
		this.gravityElectric = false;

	}

	onResize () {

		this.camera.aspect = window.innerWidth / window.innerHeight;
	    this.camera.updateProjectionMatrix();

	    this.renderer.setSize( window.innerWidth, window.innerHeight );

	}

	build ( _callback ) {

		// Build genereal

		this.quadGeometry = new THREE.PlaneBufferGeometry ( 1, 1 );

		// Player

		this.player = new PhysicalElement ( {

			position: [ 0, this.getWorldTop () + 0.2, 0 ],
			scale: [ 0.000001, 0.000001, 0.000001 ],
			enabled: true,

		} );

		this.playerScaleTarget = 0.13;
		
		this.playerMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.circle.vertex,
			fragmentShader: shaderHelper.circle.fragment,

			uniforms: { 

				diffuse: { value: [ 0.2, 0.2, 0.2, 0.8 ] },

			},

			transparent: true,

		} );

		this.playerMesh = new THREE.Mesh ( this.quadGeometry, this.playerMaterial );
		this.playerMesh.renderOrder = 20;
		this.playerMesh.position.set ( this.player.position[ 0 ], this.player.position[ 1 ], this.player.position[ 2 ] );
		this.playerMesh.scale.set ( this.player.scale[ 0 ], this.player.scale[ 1 ], this.player.scale[ 2 ] );
		this.scene.add ( this.playerMesh );

		// Particles

		this.enableParticles = false;
		this.nParticles = 200;
		this.particles = [];

		this.particlesMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.introParticles.vertex,
			fragmentShader: shaderHelper.introParticles.fragment,
			transparent: true,

		} );

		this.particlesGeometry = new THREE.BufferGeometry ();
		this.particlesGeometry.addAttribute ( 'position', new THREE.BufferAttribute ( new Float32Array ( this.nParticles * 3 ), 3 ) );

		this.particlesPoints = new THREE.Points ( this.particlesGeometry, this.particlesMaterial );
		this.particlesPoints.renderOrder = 10000;

		this.scene.add ( this.particlesPoints );

		//
		// Intro
		//

		this.introEnd = false;
		this.arrivalMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.introArrival.vertex,
			fragmentShader: shaderHelper.introArrival.fragment,
			transparent: true,

		} );

		this.arrivalScaleTarget = 0.0;
		this.arrival = new THREE.Mesh ( this.quadGeometry, this.arrivalMaterial );
		this.arrival.scale.set ( 0.000001, 0.000001, 0.000001 );
		this.scene.add ( this.arrival );

		this.nParticles = 120;

		this.particles = [];

		this.particlesGeometry = new THREE.BufferGeometry ();
		this.particlesGeometry.addAttribute ( 'position', new THREE.BufferAttribute ( new Float32Array ( this.nParticles * 3 ), 3 ) );
		this.particlesGeometry.attributes.position.dynamic = true;
		this.particlesMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.introParticles.vertex,
			fragmentShader: shaderHelper.introParticles.fragment,
			transparent: true,

		} );

		this.particlePoints = new THREE.Points ( this.particlesGeometry, this.particlesMaterial )
		this.scene.add ( this.particlePoints );

		// End circle

		this.endCircleScaleTarget = 0.0;
		this.endCircleAlphaTarget = 1.0;
		this.endCircleMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.introEndCircles.vertex,
			fragmentShader: shaderHelper.introEndCircles.fragment,

			uniforms: {

				alpha: { value: 0.0 },
				scale: { value: 0.0 },

			},

			transparent: true,

		} );

		this.endCircle = new THREE.Mesh ( this.quadGeometry, this.endCircleMaterial );
		this.scene.add ( this.endCircle );

		//
		// Gravity
		//

		this.nMasses = 50;
		this.masses = [];

		this.nPlanets = 3;
		this.planets = [];
		this.planetsMesh = [];

		this.planetMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.planet.vertex,
			fragmentShader: shaderHelper.planet.fragment,
			transparent: true,

		} );

		for ( let i = 0; i < this.nPlanets; i ++ ) {

			this.planets.push ( new PhysicalElement ( {

				position: [ 0, 0, 0 ],
				scale: [ 2, 2, 2 ],
				mass: 10000,

			} ) );

			this.planetsMesh.push ( new THREE.Mesh ( this.quadGeometry, this.planetMaterial ) );

		}

		//
		// Electric
		//

		this.nCharges = 5;
		this.charges = [];
		this.chargesMeshes = [];

		//
		// Gravity Electric
		//

		this.nElectricPlanets = 3;
		this.planets = [];
		this.planetCharges = [];

		let textureLoader = new THREE.TextureLoader().load( './resources/textures/generic_circle_sdf_unity.png', function ( texture ) {

			this.genericTexture = texture;
			this.canDrawMasses = true;
			this.canCreateCharge = true;

			_callback ();

		}.bind ( this ) );

	}

	render () {

		this.renderer.render ( this.scene, this.camera );

	}

	update () {

		if ( !this.run ) return;

		this.updatePlayer ();
		if ( this.enableParticles ) this.emitParticles ();
		if ( this.particles.length > 0 ) this.updateParticles ();

		this.updateIntro ();
		this.updateMainMenu ();
		this.updateGravity ();
		this.updateElectric ();
		this.updateGravityElectric ();

	}

	init () {

	}

	onEnd ( _callback ) {

		this.onEndCallback = _callback;

	}

	getWidth () {

		return this.renderer.domElement.offsetWidth * this.renderer.getPixelRatio();

	}

	getHeight () {

		return this.renderer.domElement.offsetHeight * this.renderer.getPixelRatio();

	}

	getWorldTop () {

		return this.get3DPointOnBasePlane ( new THREE.Vector2 ( 0, 0 ) ).y;

	}

	getWorldBottom () {

		return this.get3DPointOnBasePlane ( new THREE.Vector2 ( 0, this.getHeight() ) ).y;

	}

	getWorldLeft () {

		return this.get3DPointOnBasePlane ( new THREE.Vector2 ( 0, 0 ) ).x;

	}

	getWorldRight () {

		return this.get3DPointOnBasePlane ( new THREE.Vector2 ( this.getWidth(), 0 ) ).x;

	}

	get3DPointOnBasePlane ( _vector ) {

		let vector = new THREE.Vector3();
		vector.set( ( _vector.x / this.getWidth() ) * 2 - 1, - ( _vector.y / this.getHeight() ) * 2 + 1, 0.5 );
		vector.unproject( this.camera );
		let dir = vector.sub( this.camera.position ).normalize();
		let distance = - this.camera.position.z / dir.z;

		return this.camera.position.clone().add( dir.multiplyScalar( distance ) );

	}

	disable () {

		this.intro = false;
		this.mainMenu = false;
		this.gravity = false;
		this.electric = false;
		this.gravityElectric = false;

	}

	initIntro ( _callback ) {

		this.run = true;
		this.intro = true;
		this.player.position = [ 0, this.getWorldTop () + 0.2, 0 ];
		// this.player.acceleration = [ 0.06, -0.06, 0 ];
		this.player.acceleration = [ 0, -0.06, 0 ];
		this.player.mass = 400;
		this.player.drag = 0.985;
		this.arrivalScaleTarget = 1.0;
		this.enableParticles = true;
		this.introOnEndCallback = _callback;

	}

	updateIntro () {
	
		// Apply force towars the target when intro is active.

		if ( this.intro ) {

			let arrivapPosition = [ this.arrival.position.x, this.arrival.position.y, this.arrival.position.z ];
			let force = vec3.sub ( vec3.create (), arrivapPosition, this.player.position );
			let dist = vec3.length ( force );
			vec3.normalize ( force, force );
			let mag = 1.0 / Math.pow ( ( dist + 1.0 ), 2 );
			vec3.scale ( force, force, mag * 5 );
			if ( !this.introEnd ) this.player.applyForce ( force );

			// Check if ended

			if ( dist < 0.3 && !this.introEnd ) {

				this.arrivalScaleTarget = 0.000001;
				this.player.drag = 0.98;
				this.endCircleScaleTarget = this.getWorldTop () > this.getWorldRight () ? this.getWorldTop () * 2 : this.getWorldRight () * 2;
				this.endCircleAlphaTarget = 0.0;
				this.introEnd = true;
				
				if ( this.introOnEndCallback ) this.introOnEndCallback ();

			}

		}

		// Update the target

		this.arrival.scale.x += ( this.arrivalScaleTarget - this.arrival.scale.x ) * 0.08;
		this.arrival.scale.y += ( this.arrivalScaleTarget - this.arrival.scale.y ) * 0.08;

		// Update the end circle

		this.endCircleMaterial.uniforms.scale.value += ( this.endCircleScaleTarget - this.endCircleMaterial.uniforms.scale.value ) * 0.05;
		this.endCircleMaterial.uniforms.alpha.value += ( this.endCircleAlphaTarget - this.endCircleMaterial.uniforms.alpha.value ) * 0.05;

		// Check disabled objects

		if ( this.arrival.scale.x < 0.001 ) {

			this.arrival.visible = false;

		} else {

			this.arrival.visible = true;

		}

		if ( this.endCircleMaterial.uniforms.alpha.value < 0.001 ) {

			this.endCircle.visible = false;

		} else {

			this.endCircle.visible = true;

		}

	}

	initMainMenu () {

		this.intro = false;
		this.mainMenu = true;
		this.gravity = false;
		this.electric = false;
		this.gravityElectric = false;

		this.enableParticles = true;
		this.player.drag = 0.99;
		this.player.mass = 400;
		this.playerScaleTarget = 0.13;
		this.player.scale = [ this.playerScaleTarget, this.playerScaleTarget, this.playerScaleTarget ];
		this.forcePosition = [ 0, 0, 0 ];
		this.resetForceTimeout = null;
		this.canResetForcePosition = true;

	}

	updateMainMenu () {

		if ( this.mainMenu ) {

			if ( this.canResetForcePosition ) {

				this.forcePosition = [ ( Math.random () - 0.5 ) * 2.0, ( Math.random () - 0.5 ) * 2.0, 0.0 ];
				this.canResetForcePosition = false;

				this.resetForceTimeout = setTimeout ( function () {

					this.canResetForcePosition = true;

				}.bind ( this ), 2000 );

			}

			let force = vec3.sub ( [ 0, 0, 0 ], this.forcePosition, this.player.position );
			let dist = vec3.length ( force );
			vec3.normalize ( force, force );
			let mag = ( 1.0 / Math.pow ( dist + 1.0, 2 ) ) * 4;
			this.player.applyForce ( vec3.scale ( force, force, mag ) );

			if ( dist < 0.3 ) {

				clearTimeout ( this.resetForceTimeout );
				this.canResetForcePosition = true;

			}

			// Check edges

			this.mirrorEdges ();

		}

	}

	initGravity () {

		this.intro = false;
		this.mainMenu = false;
		this.gravity = true;
		this.electric = false;
		this.gravityElectric = false;
		this.forcePosition = [ 0, 0, 0 ];
		this.resetForceTimeout = null;
		this.canResetForcePosition = true;
		this.player.drag = 0.98;

		if ( !this.massDrawer ) {

			this.massDrawer = new PhysicalElement ( {

				position: this.getRandomEdgePosition (),
				mass: 400,
				drag: 0.98,
				acceleration: [ ( Math.random () - 0.5 ) * 0.3, ( Math.random () - 0.5 ) * 0.3, 0 ],
				enabled: true,

			} );

		}

		if ( !this.massesPoints ) {

			this.massesGeometry = new THREE.BufferGeometry ();
			this.massesGeometry.addAttribute ( 'position', new THREE.BufferAttribute ( new Float32Array ( this.nMasses * 3 ), 3 ) );
			this.massesMaterial = new THREE.ShaderMaterial ( {

				vertexShader: shaderHelper.introGenericCirclePoint.vertex,
				fragmentShader: shaderHelper.introGenericCirclePoint.fragment,

				uniforms: {

					solidColor: { value: [ 0.8, 0.8, 0.8, 1 ] },
					texture: { value: this.genericTexture },

				},

				blending: THREE.MultiplyBlending,
				transparent: true,

			} );

			this.massesPoints = new THREE.Points ( this.massesGeometry, this.massesMaterial );
			this.scene.add ( this.massesPoints );
			this.massesMaterial.extensions.derivatives = true;

		}

		if ( this.genericTexture ) {

			this.canDrawMasses = true;

		}

	}

	updateGravity () {

		if ( this.gravity ) {

			if ( this.canDrawMasses && this.masses.length < this.nMasses ) {

				let rS = Math.random () * 0.5 + 0.5;

				this.canDrawMasses = false;

				this.masses.push ( new PhysicalElement ( {

					position: this.massDrawer.position,
					scale: [ 0, 0, 0 ],
					drag: 0.9,
					acceleration: [ ( Math.random () - 0.5 ) * 0.01, ( Math.random () - 0.5 ) * 0.01, 0 ],
					enabled: true,
					targetScale: [ rS, rS, rS ],
					canDye: true,
					lifeSpan: 5000,

				} ) );

				setTimeout ( function () {

					this.canDrawMasses = true;

				}.bind ( this ), 30 );

			}

			// Update mass drawer

			if ( this.canResetForcePosition ) {

				this.forcePosition = [ ( Math.random () - 0.5 ) * 4.0, ( Math.random () - 0.5 ) * 4.0, 0.0 ];
				this.canResetForcePosition = false;

				this.resetForceTimeout = setTimeout ( function () {

					this.canResetForcePosition = true;

				}.bind ( this ), 2000 );

			}

			let force = vec3.sub ( [ 0, 0, 0 ], this.forcePosition, this.massDrawer.position );
			let dist = vec3.length ( force );
			vec3.normalize ( force, force );
			let mag = ( 1.0 / Math.pow ( dist + 1.0, 2 ) ) * 4;
			this.massDrawer.applyForce ( vec3.scale ( force, force, mag ) );

			if ( dist < 0.3 ) {

				clearTimeout ( this.resetForceTimeout );
				this.canResetForcePosition = true;

			}

			this.massDrawer.update ();
			this.mirrorEdges ( this.massDrawer.position );

			// Update masses

			this.mirrorEdges ();

		}

		if ( this.masses.length > 0 ) {

			this.massesPoints.visible = true;

			for ( let i = this.nMasses - 4; i >= 0; i -- ) {

				let bufferIndex = i * 3;

				if ( i < this.masses.length ) {

					let force = vec3.sub ( [ 0, 0, 0 ], this.masses[ i ].position, this.player.position );
					let dist = vec3.length ( force );
					let minDist = ( this.masses[ i ].scale[ 0 ] * this.masses[ i ].lifePercent + this.player.scale[ 0 ] ) * 0.5;
					vec3.normalize ( force, force );
					let mag = ( 1.0 / Math.pow ( dist + 1.0, 2.0 ) ) * 0.2;

					if ( dist < minDist ) {

						this.emitParticles ( 50, 0.1 );
						this.player.position = this.getRandomEdgePosition ();
						this.player.velocity = [ ( Math.random () - 0.5 ) * 0.3, ( Math.random () - 0.5 ) * 0.3, 0 ];

					}

					this.player.applyForce ( vec3.scale ( force, force, mag ) );

					if ( this.masses[ i ].isDead () ) {

						this.masses.splice ( i, 1 );

					} else {

						this.masses[ i ].scale[ 0 ] += ( this.masses[ i ].targetScale[ 0 ] - this.masses[ i ].scale[ 0 ] ) * 0.1;
						this.masses[ i ].scale[ 1 ] += ( this.masses[ i ].targetScale[ 1 ] - this.masses[ i ].scale[ 1 ] ) * 0.1;
						this.masses[ i ].update ();
						
						this.massesGeometry.attributes.position.array[ bufferIndex + 0 ] = this.masses[ i ].position[ 0 ];
						this.massesGeometry.attributes.position.array[ bufferIndex + 1 ] = this.masses[ i ].position[ 1 ];
						this.massesGeometry.attributes.position.array[ bufferIndex + 2 ] = this.masses[ i ].scale[ 0 ] * this.renderer.getPixelRatio () * 100 * this.masses[ i ].lifePercent;

					}

				} else {

					this.massesGeometry.attributes.position.array[ bufferIndex + 0 ] = 0;
					this.massesGeometry.attributes.position.array[ bufferIndex + 1 ] = 0;
					this.massesGeometry.attributes.position.array[ bufferIndex + 2 ] = 0;

				}

			}

			this.massesGeometry.attributes.position.needsUpdate = true;

		} else {

			if ( this.massesPoints ) this.massesPoints.visible = false;

		}

	}

	initElectric () {

		this.intro = false;
		this.mainMenu = false;
		this.gravity = false;
		this.electric = true;
		this.gravityElectric = false;
		this.canCreateCharge = false;
		this.player.mass = 800;
		this.player.drag = 0.9855;

		if ( this.genericTexture ) {

			this.canCreateCharge = true;

		}

	}

	updateElectric () {

		if ( this.electric ) {

			// Create charges

			if ( this.charges.length < this.nCharges - 1 && this.canCreateCharge ) {
				
				this.canCreateCharge = false;

				let newCharge = new ElectricParticle ( {

					position: [ ( Math.random () - 0.5 ) * 4.0, ( Math.random () - 0.5 ) * 4.0, 0 ],
					maxRadius: 1.6,
					targetRadius: 1.0 * Math.random () + 0.6,
					drag: 0.98,
					canDye: true,
					lifeSpan: 8000 * Math.random () + 5000,
					enabled: true,

				} );

				this.charges.push ( newCharge );

				let chargeMaterial = new THREE.ShaderMaterial ( {

					vertexShader: shaderHelper.introGenericCircle.vertex,
					fragmentShader: shaderHelper.introGenericCircle.fragment,

					uniforms: {

						texture: { value: this.genericTexture },
						solidColor: { value: [ 0, 0, 0, 1 ] },

					},

					transparent: true,

				} );

				let chargeMesh = new THREE.Mesh ( this.quadGeometry, chargeMaterial );
				chargeMesh.renderOrder = 0;
				this.chargesMeshes.push ( chargeMesh );
				this.scene.add ( chargeMesh );
				chargeMaterial.extensions.derivatives = true;

				setTimeout ( function () {

					this.canCreateCharge = true;

				}.bind ( this ), Math.random () * 1500 );

			}

			// Check edges.

			this.mirrorEdges ();

		} else {

			for ( let i = 0; i < this.charges.length; i ++ ) {

				this.charges[ i ].kill ();

			}

		}

		// Update charges

		for ( let i = this.charges.length - 1; i >= 0 ; i -- ) {

			for ( let j = this.charges.length - 1; j >= 0 ; j -- ) {

				if ( j != i ) {

					let force = vec3.sub ( [ 0, 0, 0 ], this.charges[ i ].position, this.charges[ j ].position );
					let dist = vec3.length ( force );
					let minDist = ( this.charges[ i ].scale[ 0 ] + this.charges[ j ].scale[ 0 ] ) * 0.5;

					if ( dist < minDist ) {

						let mag = Math.pow ( minDist - dist, 3 );
						vec3.normalize ( force, force );
						this.charges[ i ].applyForce ( vec3.scale ( force, force, mag ) );

					}

				}

			}

			this.charges[ i ].update ();
			this.chargesMeshes[ i ].position.set ( this.charges[ i ].position[ 0 ], this.charges[ i ].position[ 1 ], this.charges[ i ].position[ 2 ] );
			this.chargesMeshes[ i ].scale.set ( this.charges[ i ].scale[ 0 ], this.charges[ i ].scale[ 1 ], this.charges[ i ].scale[ 2 ] );
			this.chargesMeshes[ i ].material.uniforms.solidColor.value = this.charges[ i ].color;

			// Update the player

			let force = vec3.sub ( [ 0, 0, 0 ], this.charges[ i ].position, this.player.position );
			let dist = vec3.length ( force );
			let minDist = ( this.charges[ i ].scale[ 0 ] + this.player.scale[ 0 ] ) * 0.5;
			vec3.normalize ( force, force );
			let mag = ( 1.0 / Math.pow ( dist + 1.0, 2.0 ) ) * 1000.0 * this.charges[ i ].charge;

			if ( dist < minDist ) {

				this.emitParticles ( 50, 0.1 );
				this.player.position = this.getRandomEdgePosition ();
				this.player.velocity = [ ( Math.random () - 0.5 ) * 0.3, ( Math.random () - 0.5 ) * 0.3, 0 ];

			} else {

				this.player.applyForce ( vec3.scale ( force, force, mag ) );
				
			}

			if ( this.checkEdges ( this.charges[ i ].position, this.charges[ i ].scale[ 0 ] * 0.5 ) ) this.charges[ i ].kill ();

			if ( this.charges[ i ].isDead () ) {

				this.charges[ i ].kill ();

				if ( this.charges[ i ].color[ 3 ] < 0.001 ) {

					this.charges.splice ( i, 1 );
					this.scene.remove ( this.chargesMeshes[ i ] );
					this.chargesMeshes.splice ( i, 1 );

				}

			}

		}

	}

	initGravityElectric () {

		this.intro = false;
		this.mainMenu = false;
		this.gravity = false;
		this.electric = false;
		this.gravityElectric = true;
		this.canCreateCharge = false;
		this.player.mass = 800;
		this.player.drag = 0.9855;
		this.planetsAlphaTarget = 1.0;
		this.canChangeCharge = true;

		if ( this.electricPlanetsMaterial ) {

			this.electricPlanetsMaterial.uniforms.solidColor.value[ 3 ] = 0;

		}

		if ( !this.electricPlanets ) {

			this.nElectricPlanets = 3;
			this.electricPlanets = [];

			this.electricPlanetsMeshes = [];

			this.electricPlanetsMaterial = new THREE.ShaderMaterial ( {

				vertexShader: shaderHelper.introElectricPlanet.vertex,
				fragmentShader: shaderHelper.introElectricPlanet.fragment,

				uniforms: {

					texture: { value: this.genericTexture },
					solidColor: { value: [ 0.8, 0.8, 0.8, 0.0 ] },

				},

				transparent: true,

			} );

			this.electricPlanetsMaterial.extensions.derivatives = true;
			
			// Create planets and charges.

			let layers = [ 1, 5, 10, 20 ];
			this.nChargesPerPlanet = 0;
			this.planetCharges = [];

			for ( let i = 0; i < this.nElectricPlanets; i ++ ) {

				let rS = Math.random () + 3;

				let newElectricPlanet = new Planet ( {

					position: [ ( Math.random () - 0.5 ) * this.getWorldRight () * 2.0, ( Math.random () - 0.5 ) * this.getWorldTop () * 2.0, 0 ],
					scale: [ rS, rS, rS ],
					drag: 0.7,
					enabled: true,

				} );

				this.electricPlanets.push ( newElectricPlanet );

				// Create charges

				for ( let j = 0; j < layers.length; j ++ ) {

					this.nChargesPerPlanet += layers[ j ];

					for ( let k = 0; k < layers[ j ]; k ++ ) {

						let step = ( Math.PI * 2.0 ) / layers[ j ];
						let angle = step * k;// + ( Math.random() - 0.5 ) * 0.2;
						let dist = ( ( newElectricPlanet.scale[ 0 ] * 0.25 ) / ( layers.length - 1 ) ) * j;

						newElectricPlanet.charges.push ( new ElectricParticle ( {

							position: vec3.fromValues ( newElectricPlanet.position[ 0 ] + Math.cos ( angle ) * dist, newElectricPlanet.position[ 1 ] + Math.sin ( angle ) * dist, 0.0 ),
							targetRadius: 0.2 + Math.random () * 0.13,
							mass: 400,
							drag: 0.95,
							enabled: true,

						} ) );

					}

				}

				let newMesh = new THREE.Mesh ( this.quadGeometry, this.electricPlanetsMaterial );
				this.electricPlanetsMeshes.push ( newMesh );
				this.scene.add ( newMesh );

			}

			this.planetChargesGeometry = new THREE.BufferGeometry ();
			this.planetChargesGeometry.addAttribute ( 'position', new THREE.BufferAttribute ( new Float32Array ( this.nPlanets * this.nChargesPerPlanet * 3 ), 3 ) );
			this.planetChargesGeometry.addAttribute ( 'rgbaColor', new THREE.BufferAttribute ( new Float32Array ( this.nPlanets * this.nChargesPerPlanet * 4 ), 4 ) );
			this.planetChargesMaterial = new THREE.ShaderMaterial ( {

				vertexShader: shaderHelper.introGenericCircleElectricPlanet.vertex,
				fragmentShader: shaderHelper.introGenericCircleElectricPlanet.fragment,

				uniforms: {

					texture: { value: this.genericTexture },
					globalAlpha: { value: 0.0 },

				},

				transparent: true,

			} );

			this.planetChargesMaterial.extensions.derivatives = true;

			this.planetChargesPoints = new THREE.Points ( this.planetChargesGeometry, this.planetChargesMaterial );
			this.scene.add ( this.planetChargesPoints );

		}
		
		this.planetChargesAlphaTarget = 1.0;

	}

	updateGravityElectric () {

		if ( this.gravityElectric ) {

			// Update electric planets

			if ( this.canChangeCharge ) {

				this.canChangeCharge = false;

				for ( let i = 0; i < this.electricPlanets.length; i ++ ) {

					this.electricPlanets[ i ].targetCharge = ( Math.random () - 0.5 ) * 50;
					this.electricPlanets[ i ].sign = Math.random () > 0.5 ? 1 : -1;

				}

				setTimeout ( function () {

					this.canChangeCharge = true;

				}.bind ( this ), 3000 );

			}

			for ( let i = 0; i < this.electricPlanets.length; i ++ ) {

				this.electricPlanets[ i ].update ();

				this.electricPlanetsMeshes[ i ].position.set ( this.electricPlanets[ i ].position[ 0 ], this.electricPlanets[ i ].position[ 1 ], this.electricPlanets[ i ].position[ 2 ] );
				this.electricPlanetsMeshes[ i ].scale.set ( this.electricPlanets[ i ].scale[ 0 ], this.electricPlanets[ i ].scale[ 1 ], this.electricPlanets[ i ].scale[ 2 ] );

				if ( this.electricPlanetsMaterial.uniforms.solidColor.value[ 3 ] >= 0.001 ) {

					this.electricPlanetsMeshes[ i ].visible = true;

				}

				let gForce = vec3.sub ( [ 0, 0, 0 ], this.electricPlanets[ i ].position, this.player.position );
				let dist = vec3.length ( gForce );
				let minDist = ( this.electricPlanets[ i ].scale[ 0 ] + this.player.scale[ 0 ] ) * 0.5;
				vec3.normalize ( gForce, gForce );
				let mag = ( 1.0 / Math.pow ( dist + 1.0, 2 ) ) * 6;

				this.player.applyForce ( vec3.scale ( gForce, gForce, mag ) );

				let eMag = ( 1.0 / Math.pow ( dist + 1.0, 2 ) ) * this.electricPlanets[ i ].charge;
				this.player.applyForce ( vec3.scale ( [ 0, 0, 0 ], gForce, eMag ) );

				for ( let j = 0; j < this.electricPlanets.length; j ++ ) {

					if ( j != i ) {

						let force = vec3.sub ( [ 0, 0, 0 ], this.electricPlanets[ i ].position, this.electricPlanets[ j ].position );
						let dist = vec3.length ( force );
						let minDist = ( this.electricPlanets[ i ].scale[ 0 ] + this.electricPlanets[ j ].scale[ 0 ] ) * 0.5;
						vec3.normalize ( force, force );

						if ( dist < minDist ) {

							this.electricPlanets[ i ].applyForce ( vec3.scale ( force, force, Math.pow ( minDist - dist, 2 ) ) ) * 0.001;

						}

					}

				}

				if ( dist < minDist - 0.1 ) {

					this.emitParticles ( 50, 0.1 );
					this.player.position = this.getRandomEdgePosition ();

				}

				let charges = this.electricPlanets[ i ].charges;

				for ( let j = 0; j < charges.length; j ++ ) {

					let planetForce = vec3.sub ( [ 0, 0, 0 ], this.electricPlanets[ i ].position, charges[ j ].position );
					let dist = vec3.length ( planetForce );
					vec3.normalize ( planetForce, planetForce );
					let mag = ( 1.0 / Math.pow ( dist + 1.0, 2.0 ) ) * 2;

					if ( j != 0 ) charges[ j ].applyForce ( vec3.scale ( planetForce, planetForce, mag ) );
					if ( j == 0 ) charges[ j ].position = this.electricPlanets[ i ].position;

					for ( let k = 0; k < charges.length; k ++ ) {

						if ( k != j ) {

							let force = vec3.sub ( [ 0, 0, 0 ], charges[ j ].position, charges[ k ].position );
							let dist = vec3.length ( force );
							let minDist = ( charges[ k ].scale[ 0 ] + charges[ i ].scale[ 0 ] ) * 0.65;
							vec3.normalize ( force, force );

							if ( dist < minDist ) {

								if ( j != 0 ) charges[ j ].applyForce ( vec3.scale ( force, force, Math.pow ( minDist - dist, 2 ) * 100.0 ) );

							}

						}

					}

					charges[ j ].update ();

					let bufferPositionIndex = i * this.nChargesPerPlanet * 3 + j * 3;
					let bufferColorIndex = i * this.nChargesPerPlanet * 4 + j * 4;

					// console.log(bufferPositionIndex);

					this.planetChargesGeometry.attributes.position.array[ bufferPositionIndex + 0 ] = charges[ j ].position[ 0 ];
					this.planetChargesGeometry.attributes.position.array[ bufferPositionIndex + 1 ] = charges[ j ].position[ 1 ];
					this.planetChargesGeometry.attributes.position.array[ bufferPositionIndex + 2 ] = charges[ j ].scale[ 0 ] * this.renderer.getPixelRatio () * 100;

					this.planetChargesGeometry.attributes.rgbaColor.array[ bufferColorIndex + 0 ] = charges[ j ].color[ 0 ];
					this.planetChargesGeometry.attributes.rgbaColor.array[ bufferColorIndex + 1 ] = charges[ j ].color[ 1 ];
					this.planetChargesGeometry.attributes.rgbaColor.array[ bufferColorIndex + 2 ] = charges[ j ].color[ 2 ];
					this.planetChargesGeometry.attributes.rgbaColor.array[ bufferColorIndex + 3 ] = charges[ j ].color[ 3 ];

				}

			}

			this.planetChargesGeometry.attributes.position.needsUpdate = true;
			this.planetChargesGeometry.attributes.rgbaColor.needsUpdate = true;

			if ( this.planetChargesMaterial.uniforms.globalAlpha.value > 0.001 ) {

				this.planetChargesPoints.visible = true;

			}

			// update player

			this.mirrorEdges ();

		} else {

			this.planetsAlphaTarget = 0;
			this.planetChargesAlphaTarget = 0;

			if ( this.electricPlanetsMaterial && this.electricPlanetsMaterial.uniforms.solidColor.value[ 3 ] < 0.001 ) {

				for ( let i = 0; i < this.electricPlanetsMeshes.length; i ++ ) {

					this.electricPlanetsMeshes[ i ].visible = false;

				}

			}

			if ( this.planetChargesMaterial && this.planetChargesMaterial.uniforms.globalAlpha.value < 0.001 ) {

				this.planetChargesPoints.visible = false;

			}

		}

		if ( this.electricPlanetsMaterial ) {

			this.electricPlanetsMaterial.uniforms.solidColor.value[ 3 ] += ( this.planetsAlphaTarget - this.electricPlanetsMaterial.uniforms.solidColor.value[ 3 ] ) * 0.05;
			this.planetChargesMaterial.uniforms.globalAlpha.value += ( this.planetChargesAlphaTarget - this.planetChargesMaterial.uniforms.globalAlpha.value ) * 0.05;

		}

	}

	updatePlayer () {

		this.player.update ();
		this.player.scale[ 0 ] += ( this.playerScaleTarget - this.player.scale[ 0 ] ) * 0.1;
		this.player.scale[ 1 ] += ( this.playerScaleTarget - this.player.scale[ 1 ] ) * 0.1;
		this.playerMesh.position.set ( this.player.position[ 0 ], this.player.position[ 1 ], this.player.position[ 2 ] );
		this.playerMesh.scale.set ( this.player.scale[ 0 ], this.player.scale[ 1 ], this.player.scale[ 2 ] );

	}

	getRandomEdgePosition () {

		let offset = 0.5;

		if ( Math.random () > 0.5 ) {

			if ( Math.random () > 0.5 ) {

				return [ this.getWorldRight () + offset, ( Math.random () - 0.5 ) * this.getWorldTop () * 4.0, 0.0 ];

			} else {

				return [ this.getWorldLeft () - offset, ( Math.random () - 0.5 ) * this.getWorldTop () * 4.0, 0.0 ];

			}

		} else {

			if ( Math.random () > 0.5 ) {

				return [ ( Math.random () - 0.5 ) * this.getWorldRight () * 4.0, this.getWorldTop () + offset , 0.0 ];

			} else {

				return [ ( Math.random () - 0.5 ) * this.getWorldRight () * 4.0, this.getWorldBottom () - offset , 0.0 ];

			}

		}

	}

	checkEdges ( _position, _offset ) {

		_offset = _offset || 0;

		if ( _position[ 0 ] > this.getWorldRight () + _offset || _position[ 0 ] < this.getWorldLeft () - _offset || _position[ 1 ] > this.getWorldTop () + _offset || _position[ 1 ] < this.getWorldBottom () - _offset ) return true;
		return false; 

	}

	mirrorEdges ( _position ) {


		let offset = 0.1

		if ( _position ) {

			if ( _position[ 0 ] > this.getWorldRight () + offset ) {

				_position[ 0 ] = this.getWorldLeft () - offset;

			} else if ( _position[ 0 ] < this.getWorldLeft () - offset ) {

				_position[ 0 ] = this.getWorldRight () + offset;

			} else if ( _position[ 1 ] > this.getWorldTop () + offset ) {

				_position[ 1 ] = this.getWorldBottom () - offset;

			} else if ( _position[ 1 ] < this.getWorldBottom () - offset ) {

				_position[ 1 ] = this.getWorldTop () + offset;

			}

		} else {

			if ( this.player.position[ 0 ] > this.getWorldRight () + offset ) {

				this.player.position[ 0 ] = this.getWorldLeft () - offset;

			} else if ( this.player.position[ 0 ] < this.getWorldLeft () - offset ) {

				this.player.position[ 0 ] = this.getWorldRight () + offset;

			} else if ( this.player.position[ 1 ] > this.getWorldTop () + offset ) {

				this.player.position[ 1 ] = this.getWorldBottom () - offset;

			} else if ( this.player.position[ 1 ] < this.getWorldBottom () - offset ) {

				this.player.position[ 1 ] = this.getWorldTop () + offset;

			}

		}

	}

	emitParticles ( _num, _mag ) {

		if ( _num > 2 ) {

			this.soundManager.play ( 'Hit_sound_' + Math.floor ( Math.random () * 4 ), { volume: 1.0 } );
			this.soundManager.play ( 'Gong_sound_' + Math.floor ( Math.random () * 4 ), { volume: 0.2 } );
			this.soundManager.play ( 'Explosion_sound_' + Math.floor ( Math.random () * 3 ), { volume: 0.1 } );

		}

		// Add particles

		if ( this.particles.length < this.nParticles ) {

			for ( let i = 0; i < ( _num || 2 ); i ++ ) {

				this.particles.push ( new PhysicalElement ( {

					position: this.player.position,
					scale: [ Math.random () * 10 * this.renderer.getPixelRatio () + 1.0, 0, 0 ],
					acceleration: [ ( Math.random () - 0.5 ) * ( _mag || 0.02 ), ( Math.random () - 0.5 ) * ( _mag || 0.02 ), 0 ],
					velocity: vec3.scale ( vec3.create (), this.player.velocity, 0.2 ),
					canDye: true,
					lifeSpan: 1000 * Math.random (),
					mass: 700 * Math.random () + 700,
					enabled: true,
					drag: 0.99,

				} ) );

			}

		}

	}

	updateParticles () {

		// Update the particles & the geometry used to render them.

		for ( let i = this.nParticles - 4; i >= 0 ; i -- ) {

			let bufferIndex = i * 3;

			if ( i < this.particles.length ) {

				let force = vec3.sub ( [ 0, 0, 0 ], this.player.position, this.particles[ i ].position );
				let dist = vec3.length ( force );
				vec3.normalize ( force, force );
				let mag = ( 1.0 / Math.pow ( dist + 1.0, 2.0 ) ) * 1.0;

				this.particles[ i ].applyForce ( vec3.scale ( force, force, mag ) );
				this.particles[ i ].update ();

				this.particlesGeometry.attributes.position.array [ bufferIndex + 0 ] = this.particles[ i ].position[ 0 ];
				this.particlesGeometry.attributes.position.array [ bufferIndex + 1 ] = this.particles[ i ].position[ 1 ];
				this.particlesGeometry.attributes.position.array [ bufferIndex + 2 ] = this.particles[ i ].scale[ 0 ] * this.particles[ i ].lifePercent;

				if ( this.particles[ i ].isDead () ) {

					this.particles.splice ( i, 1 );

				}

			} else {

				this.particlesGeometry.attributes.position.array [ bufferIndex + 0 ] = 0;
				this.particlesGeometry.attributes.position.array [ bufferIndex + 1 ] = 0;
				this.particlesGeometry.attributes.position.array [ bufferIndex + 2 ] = 0;

			}

		}

		this.particlesGeometry.attributes.position.needsUpdate = true;

	}

}
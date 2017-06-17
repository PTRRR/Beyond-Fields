import { shaderHelper } from './GameElements/shaderHelper';
import { PhysicalElement } from './GameElements/PhysicalElement';

export class IntroScene {

	constructor ( _renderer ) {

		this.renderer = _renderer;

		this.run = false;
		let size = this.renderer.getSize ();
		this.camera = new THREE.PerspectiveCamera ( 75, size.width / size.height, 0.1, 1000 );
		this.camera.position.z = 5;

		this.scene = new THREE.Scene ();
		this.scene.background = new THREE.Color ( 0xE6E6E6 );
		this.renderer.render ( this.scene, this.camera );

		this.ended = false;

		this.quadGeometry = new THREE.PlaneBufferGeometry ( 1, 1 );

		this.playerMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.circle.vertex,
			fragmentShader: shaderHelper.circle.fragment,

			uniforms: { 

				diffuse: { value: [ 0.5, 0.5, 0.5, 1.0 ] },

			},


			transparent: true,

		} );

		this.player = new PhysicalElement ( {

			position: [ 0, this.getWorldTop () + 0.1, 0 ],
			mass: 1500,
			drag: 0.986,
			enabled: true,
			acceleration: [ 0.06, -0.06, 0 ],

		} );

		this.playerScaleTarget = 0.13;
		this.playerMesh = new THREE.Mesh ( this.quadGeometry, this.playerMaterial );
		this.playerMesh.scale.set ( 0.1, 0.1, 0.1 );
		this.playerMesh.position.set ( 0, this.player.position[ 1 ], 0 );
		this.playerMesh.renderOrder = 10;
		this.scene.add ( this.playerMesh );

		this.arrivalMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.introArrival.vertex,
			fragmentShader: shaderHelper.introArrival.fragment,
			transparent: true,

		} );

		this.arrivalScaleTarget = 1.0;
		this.arrival = new THREE.Mesh ( this.quadGeometry, this.arrivalMaterial );
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

			vertexShader: shaderHelper.introEndParticles.vertex,
			fragmentShader: shaderHelper.introEndParticles.fragment,

			uniforms: {

				alpha: { value: 1.0 },
				scale: { value: 0.0 },

			},

			transparent: true,

		} );

		this.endCircle = new THREE.Mesh ( this.quadGeometry, this.endCircleMaterial );
		this.scene.add ( this.endCircle );

	}

	onResize () {

		this.camera.aspect = window.innerWidth / window.innerHeight;
	    this.camera.updateProjectionMatrix();

	    this.renderer.setSize( window.innerWidth, window.innerHeight );

	}

	render () {

		this.renderer.render ( this.scene, this.camera );

	}

	update () {

		if ( !this.run ) return;

		// Update arrival

		if ( this.arrival.scale.x > 0.01 ) {
			
			this.arrival.scale.x += ( this.arrivalScaleTarget - this.arrival.scale.x ) * 0.1;
			this.arrival.scale.y += ( this.arrivalScaleTarget - this.arrival.scale.y ) * 0.1;
			
		}

		// Update player

		let force = vec3.sub ( vec3.create(), [ 0, 0, 0 ], this.player.position );
		let dist = vec3.length ( force );

		if ( dist < 0.2 && !this.ended ) {

			this.ended = true;
			this.player.drag = 0.7;
			this.playerScaleTarget = 0;
			this.arrivalScaleTarget = 0;
			this.endCircleScaleTarget = Math.abs ( this.getWorldTop () ) > Math.abs ( this.getWorldRight () ) ? this.getWorldTop () * 2.0 : this.getWorldRight () * 2.0;
			this.endCircleAlphaTarget = 0.0;
			if ( this.onEndCallback ) this.onEndCallback ();

		}

		vec3.normalize ( force, force );
		vec3.scale ( force, force, ( 1.0 / Math.pow ( ( dist + 1.0 ), 2 ) ) * 30 );

		this.player.scale[ 0 ] += ( this.playerScaleTarget - this.player.scale[ 0 ] ) * 0.1;
		this.player.scale[ 1 ] += ( this.playerScaleTarget - this.player.scale[ 1 ] ) * 0.1;
		this.player.applyForce ( force );
		this.player.update ();

		this.playerMesh.position.set ( this.player.position[ 0 ], this.player.position[ 1 ], this.player.position[ 2 ] );
		this.playerMesh.scale.set ( this.player.scale[ 0 ], this.player.scale[ 1 ], 1.0 );

		// Update particles

		for ( let i = this.nParticles - 4; i >= 0; i -- ) {
			
			let bufferIndex = i * 3;

			if ( i < this.particles.length ) {

				this.particles[ i ].update ();

				if ( !this.particles[ i ].isDead () ) {

					let dir = vec3.sub ( vec3.create (), this.player.position, this.particles[ i ].position );
					let dist = vec3.length ( dir );
					vec3.normalize ( dir, dir );
					vec3.scale ( dir, dir, ( 1.0 / Math.pow ( ( dist + 1.0 ), 2 ) ) * 1 );
					this.particles[ i ].applyForce ( dir );

					this.particlesGeometry.attributes.position.array[ bufferIndex + 0 ] = this.particles[ i ].position[ 0 ];
					this.particlesGeometry.attributes.position.array[ bufferIndex + 1 ] = this.particles[ i ].position[ 1 ];

					// pass size with position z

					this.particlesGeometry.attributes.position.array[ bufferIndex + 2 ] = this.particles[ i ].scale[ 0 ] * this.particles[ i ].lifePercent;

				} else {

					this.particles.splice ( i, 1 );

				}

			} else {

				this.particlesGeometry.attributes.position.array[ bufferIndex + 0 ] = 0;
				this.particlesGeometry.attributes.position.array[ bufferIndex + 1 ] = 0;
				this.particlesGeometry.attributes.position.array[ bufferIndex + 2 ] = 0;

			}

		}
		
		if ( this.particles.length < this.nParticles && !this.ended ) {

			this.createNewParticle ();
			this.createNewParticle ();

		}

		this.particlesGeometry.attributes.position.needsUpdate = true;

		this.endCircleMaterial.uniforms.alpha.value += ( this.endCircleAlphaTarget - this.endCircleMaterial.uniforms.alpha.value ) * 0.08;
		this.endCircleMaterial.uniforms.scale.value += ( this.endCircleScaleTarget - this.endCircleMaterial.uniforms.scale.value ) * 0.08;

	}

	createNewParticle () {

		this.particles.push ( new PhysicalElement ( {

			position: this.player.position,
			scale: [ Math.random () * 10 * this.renderer.getPixelRatio () + 1.0, 0, 0 ],
			acceleration: [ ( Math.random () - 0.5 ) * 0.03, ( Math.random () - 0.5 ) * 0.03, 0 ],
			velocity: vec3.scale ( vec3.create (), this.player.velocity, 0.2 ),
			canDye: true,
			lifeSpan: 1000,
			lifeLeft: 1000,
			mass: 20000,
			enabled: true,
			drag: 0.98,

		} ) );

	}

	init () {

		this.run = true;

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

}
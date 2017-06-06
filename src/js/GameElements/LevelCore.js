import { Float32Concat } from '../utils';
import { shaderHelper } from './shaderHelper';

export class LevelCore {

	constructor ( _options ) {

		if ( !_options || !_options.levelFile ) {

			this.throwError ( 'You must specify a level file to build a level' );
			return;

		} else if ( !_options || !_options.renderer ) {

			this.throwError ( 'You must pass the renderer element to the level' );
			return;

		}

		// Core elements

		this.levelFile = _options.levelFile;
		this.renderer = _options.renderer;

		this.mouse = new THREE.Vector2 ();
		this.mouseWorld = new THREE.Vector3 ();
		this.raycaster = new THREE.Raycaster ();

		// Level elements

		this.mainCamera = new THREE.PerspectiveCamera ( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.mainCamera.position.z = 5;

		this.mainScene = new THREE.Scene ();
		this.mainScene.background = new THREE.Color ( 0xEFEFEF );

		this.scanScene = new THREE.Scene ();
		this.scanSceneRenderTarget = new THREE.WebGLRenderTarget ( window.innerWidth, window.innerHeight, { depthBuffer: false, stencilBuffer: false } );
		this.scanScene.background = new THREE.Color ( 0x000000 );

		this.infoScene = new THREE.Scene ();
		this.infoSceneRenderTarget = new THREE.WebGLRenderTarget ( window.innerWidth, window.innerHeight, { depthBuffer: false, stencilBuffer: false } );
		this.infoScene.background = new THREE.Color ( 0x808080 );

		// Render all scenes once the get right matrices.

		this.renderer.render ( this.mainScene, this.mainCamera );
		this.renderer.render ( this.scanScene, this.mainCamera );
		this.renderer.render ( this.infoScene, this.mainCamera );

		// Objects

		this.gameElements = {};
		
	}

	onMove ( _position ) {

		this.mouse.x = _position[ 0 ];
		this.mouse.y = _position[ 1 ];

		this.updateMouseWorld ( this.mouse );

	}

	onClick ( _position ) {

		this.mouse.x = _position[ 0 ];
		this.mouse.y = _position[ 1 ];

		this.updateMouseWorld ( this.mouse );

	}

	build () {

		// Declare some useful variables

		this.worldTop = this.get3DPointOnBasePlane ( new THREE.Vector2 ( 0, 0 ) ).y;
		this.worldBottom = this.get3DPointOnBasePlane ( new THREE.Vector2 ( 0, window.innerHeight ) ).y;
		this.worldLeft = this.get3DPointOnBasePlane ( new THREE.Vector2 ( 0, 0 ) ).x;
		this.worldRight = this.get3DPointOnBasePlane ( new THREE.Vector2 ( window.innerWidth, 0 ) ).x;

		// Add base elements.
		// Add the scale square in the background.

		this.addElement ( 'scaleSquare', {

			static: true,
			manualMode: false,

			shaders: {

				main: null,

				normal: {

					name: 'solidQuad',
					// textureUrl: './resources/textures/generic_circle_sdf.png',
					uniforms: {

						solidColor: { value: [ 0.9, 0.9, 0.9, 1.0 ] },

					}

				},

				scan: {

					name: 'simpleTexture',
					textureUrl: './resources/textures/generic_circle_sdf.png',
					uniforms: {},

				},

				infos: {

					name: 'simpleTexture',
					textureUrl: './resources/textures/generic_circle_sdf.png',
					uniforms: {},

				},

			},

			instances: {

				0: {

					enabled: true,
					position: vec3.fromValues ( 0, 0, 0 ),
					rotation: vec3.fromValues ( 0.0, 0.0, 0.0 ),
					scale: vec3.fromValues ( 2.0, 2.0, 1.0 ),
					velocity: { x: 0, y: 0, z: 0 },

				}

			}

		} );

		// Add the goals elements.

		this.addElement ( 'goals', {

			static: true,
			manualMode: false,

			shaders: {

				main: null,

				normal: {

					name: 'solidQuad',
					uniforms: {

						solidColor: { value: [ 0.7, 0.7, 0.7, 1.0 ] },

					}

				},

				scan: null,
				infos: null,

			},

			instances: {

				0: {

					enabled: true,
					position: vec3.fromValues ( 0, this.worldTop, 0 ),
					rotation: vec3.fromValues ( 0.0, 0.0, 0.0 ),
					scale: vec3.fromValues ( 1.0, 0.2, 0.5 ),
					velocity: { x: 0, y: 0, z: 0 },

				},

				1: {

					enabled: true,
					position: vec3.fromValues ( 0, this.worldBottom, 0 ),
					rotation: vec3.fromValues ( 0.0, 0.0, 0.0 ),
					scale: vec3.fromValues ( 1.0, 0.2, 0.5 ),
					velocity: { x: 0, y: 0, z: 0 },

				}

			}

		} );

		// Add level elements

		for ( let elementName in this.levelFile.elements ) {

			let element = this.levelFile.elements[ elementName ];
			let manualMode = element.manualMode;

			if ( !manualMode ) {

				this.addElement ( elementName, element );

			}

		}

	}

	addElement ( _name, _element ) {

		this.gameElements[ _name ] = {};

		let textureUrl = _element.texture;
		let shaders = _element.shaders;
		let instances = _element.instances;

		if ( _element.static ) {

			// Build a geometry composed with quads.

			let vertices = [];
			let colors = [];
			let uvs = [];
			let indices = [];

			for ( let instanceIndex in instances ) {

				let instance = instances[ instanceIndex ];

				// Set default variables if missing.

				instance.position = instance.position || vec3.fromValues ( 0.0, 0.0, 0.0 );
				instance.rotation = instance.rotation || vec3.fromValues ( 0.0, 0.0, 0.0 );
				instance.scale = instance.scale || vec3.fromValues ( 1.0, 1.0, 1.0 );
				instance.color = instance.color || vec4.fromValues ( 1.0, 1.0, 1.0, 1.0 );

				// Create a quad with the position, rotation, and scale of the object.

				let quad = this.getQuad ( instance.position, instance.rotation, instance.scale );

				// Update the indices

				for ( let i = 0; i < quad.indices.length; i ++ ) {

					indices.push ( quad.indices[ i ] + vertices.length / 3 );

				}

				// Update vertices

				for ( let i = 0; i < quad.vertices.length; i ++ ) {

					vertices.push ( quad.vertices[ i ] );

				}

				// Update uvs

				for ( let i = 0; i < quad.uvs.length; i ++ ) {

					uvs.push ( quad.uvs[ i ] );

				}

				// Update colors

				for ( let i = 0; i < 4; i ++ ) {

					colors.push ( instance.color[ 0 ] );
					colors.push ( instance.color[ 1 ] );
					colors.push ( instance.color[ 2 ] );
					colors.push ( instance.color[ 3 ] );

				}


			}

			let geometry = new THREE.BufferGeometry ();
			geometry.setIndex ( new THREE.BufferAttribute ( new Uint32Array ( indices ), 1 ) );
			geometry.addAttribute ( 'position', new THREE.BufferAttribute ( new Float32Array ( vertices ), 3 ) );
			geometry.addAttribute ( 'rgbaColor', new THREE.BufferAttribute ( new Float32Array ( colors ), 4 ) );
			geometry.addAttribute ( 'uv', new THREE.BufferAttribute ( new Float32Array ( uvs ), 2 ) );

			this.getElementMaterial ( _element, function ( materials ) {

				if ( materials.main ) {

					let mainMesh = new THREE.Mesh ( geometry, materials.main );
					this.mainScene.add ( mainMesh );
					this.scanScene.add ( mainMesh );
					this.infoScene.add ( mainMesh );

				} else {

					if ( materials.normal ) {

						let normalMesh = new THREE.Mesh ( geometry, materials.normal );
						this.mainScene.add ( normalMesh );

					} 

					if ( materials.scan ) {

						let scanMesh = new THREE.Mesh ( geometry, materials.scan );
						this.scanScene.add ( scanMesh );

					}

					if ( materials.info ) {

						let infoMesh = new THREE.Mesh ( geometry, materials.info );
						this.infoScene.add ( infoMesh );

					}

				}

			}.bind ( this ) );

		} else {



		}

	}

	getQuad ( position, rotation, scale ) {

		// Create a qud geometry composed of four vertices uvs and indices.

		let vertices = [];
		let uvs = [ 0, 0, 1, 0, 1, 1, 0, 1 ];
		let indices = [ 0, 1, 2, 2, 3, 0 ];

		let v = [

			vec3.fromValues ( -1.0, -1.0, 0.0 ),
			vec3.fromValues ( 1.0, -1.0, 0.0 ),
			vec3.fromValues ( 1.0, 1.0, 0.0 ),
			vec3.fromValues ( -1.0, 1.0, 0.0 )

		];

		let modelMatrix = mat4.create();
		mat4.translate ( modelMatrix, modelMatrix, position );
		mat4.scale ( modelMatrix, modelMatrix, scale );
		mat4.rotateX ( modelMatrix, modelMatrix, rotation[ 0 ], [ 1, 0, 0 ] );
		mat4.rotateY ( modelMatrix, modelMatrix, rotation[ 1 ], [ 0, 1, 0 ] );
		mat4.rotateZ ( modelMatrix, modelMatrix, rotation[ 2 ], [ 0, 0, 1 ] );

		for ( let i = 0; i < 4; i ++ ) {

			vec3.transformMat4 ( v[ i ], v[ i ], modelMatrix );

			vertices.push ( v[ i ][ 0 ] );
			vertices.push ( v[ i ][ 1 ] );
			vertices.push ( v[ i ][ 2 ] );

		}

		return {

			vertices: vertices,
			uvs: uvs,
			indices: indices,

		}

	}

	getElementMaterial ( _element, _onLoad ) {

		let shaders = _element.shaders;
		let materials = {};
		let numShaders = Object.keys( shaders ).length;

		for ( let type in shaders ) {

			let shader = shaders[ type ];

			if ( shader ) {
				
				if ( shader.textureUrl ) {

					( function ( shader ) {

						let texture = new THREE.TextureLoader().load ( shader.textureUrl, function ( texture ) {

							let uniforms = shader.uniforms;
							uniforms.texture = { value: texture };

							materials[ type ] = new THREE.ShaderMaterial ( {

								vertexShader: shaderHelper[ shader.name ].vertex,
								fragmentShader: shaderHelper[ shader.name ].fragment,
								uniforms: uniforms,

							} );

							materials[ type ].transparent = true;

							numShaders --;
							checkLoad ();

						} );

					} )( shader );

				} else {

					materials[ type ] = new THREE.ShaderMaterial ( {

						vertexShader: shaderHelper[ shader.name ].vertex,
						fragmentShader: shaderHelper[ shader.name ].fragment,
						uniforms: shader.uniforms,

					} );

					materials[ type ].transparent = true;

					numShaders --;
					checkLoad ();

				}

			} else {

				numShaders --;
				materials[ type ] = null;
				checkLoad ();

			}

		}

		function checkLoad () {

			if ( numShaders == 0 ) {

				_onLoad ( materials );

			}

		}

	}

	updateMouseWorld ( _mouse ) {

		this.mouseWorld = this.get3DPointOnBasePlane ( _mouse );

	}

	get3DPointOnBasePlane ( _vector ) {

		let vector = new THREE.Vector3();
		vector.set( ( _vector.x / window.innerWidth ) * 2 - 1, - ( _vector.y / window.innerHeight ) * 2 + 1, 0.5 );
		vector.unproject( this.mainCamera );
		let dir = vector.sub( this.mainCamera.position ).normalize();
		let distance = - this.mainCamera.position.z / dir.z;

		return this.mainCamera.position.clone().add( dir.multiplyScalar( distance ) );

	}

	update () {


	}

	render () {

		this.renderer.render ( this.mainScene, this.mainCamera );

	}

	log ( _string ) {

		let text = _string + "";
		console.log ( this.constructor.name + ": " + text );

	}

	logWarn ( _string ) {

		let text = _string + "";
		console.warn ( this.constructor.name + " WARN: " + text );

	}

	logError ( _string ) {

		let text = _string + "";
		console.error ( this.constructor.name + " ERROR: " + text );

	}

	throwError ( _string ) {

		let text = _string + "";
		throw this.constructor.name + " ERROR: " + text;

	}

}
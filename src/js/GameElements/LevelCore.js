import { Float32Concat, contains } from '../utils';
import { shaderHelper } from './shaderHelper';
import { library } from './library';
import { PhysicalElement } from './PhysicalElement';

// Import some npm libs

let sdfShader = require ( 'three-bmfont-text/shaders/sdf' );
let msdfShader = require ( 'three-bmfont-text/shaders/msdf' );
let bmfontGeometry = require ( 'three-bmfont-text' );
let bmfontLoader = require ( 'load-bmfont' );

let bezier = require ( 'adaptive-bezier-curve' );
let quadratic = require ( 'adaptive-quadratic-curve' );
let line = require ( 'three-line-2d' )( THREE );
let basicShader = require ( 'three-line-2d/shaders/basic' )( THREE );
let getNormals = require ( 'polyline-normals' );
let dynamicBuffer = require ( 'three-buffer-vertex-data' );

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

		this.levelCompleted = false;
		this.loadObjects = 0;
		this.levelLoaded = false;
		this.levelStarted = false;
		this.levelIsReady = false;
		this.elementToLoad = 0;
		this.levelFile = _options.levelFile;
		this.renderer = _options.renderer;
		this.renderer.autoClear = false;
		this.onWinCallback = function () { console.log( 'you won' ) };
		this.soundManager = _options.soundManager;

		this.glMouse = vec3.create ();
		this.glMouseWorld = vec3.create ();
		this.mouse = new THREE.Vector2 ();
		this.mouseWorld = new THREE.Vector3 ();
		this.raycaster = new THREE.Raycaster ();

		// Multitouch update

		this.touchDown = false;
		this.touches = {};
		this.worldTouches = {};
		this.glTouches = {};
		this.glWorldTouches = {};

		// Level elements

		this.mainCamera = new THREE.PerspectiveCamera ( 75, this.getWidth() / this.getHeight(), 0.1, 1000 );
		this.mainCamera.position.z = 5;

		this.mainScene = new THREE.Scene ();
		this.mainScene.background = new THREE.Color ( 0xEFEFEF );

		this.genericQuad = this.getQuad ( [ 0, 0, 0 ], [ 0, 0, 0 ], [ 1, 1, 1 ] );
		this.quadGeometry = new THREE.PlaneGeometry ( 1, 1 ); 
		this.screensScene = new THREE.Scene ();
		this.activeScreensBoundToTouch = null;
		this.screenMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.screen.vertex,
			fragmentShader: shaderHelper.screen.fragment,
			uniforms: {

				texture: { value: null },
				screenDimentions: { value: [ this.getWidth(), this.getHeight() ] }

			},
			transparent: true,
			depthWrite: false,
			depthTest: false,

		} );

		this.scanScene = new THREE.Scene ();
		this.scanScene.background = new THREE.Color ( 0x000000 );
		this.scanSceneRenderTarget = new THREE.WebGLRenderTarget ( this.getWidth(), this.getHeight(), { depthBuffer: false, stencilBuffer: false } );
		
		this.scanScreenTargetPosition = new THREE.Vector3 ( 0, 0, 0 );
		this.scanScreenClosed = true;
		this.scanScreenOpened = false;
		this.scanScreen = new THREE.Mesh ( this.quadGeometry, this.screenMaterial.clone () );
		this.scanScreen.material.uniforms.texture.value = this.scanSceneRenderTarget.texture;

		this.scanScreenButtonMaterial = this.scanScreen.material.clone ();
		this.scanScreenButtonMaterial.vertexShader = shaderHelper.screenButton.vertex;
		this.scanScreenButtonMaterial.fragmentShader = shaderHelper.screenButton.fragment;
		this.scanScreenButtonMaterial.uniforms.texture.value = this.scanSceneRenderTarget.texture;
		this.scanScreenButton = new THREE.Mesh ( this.quadGeometry, this.scanScreenButtonMaterial );
		this.scanScreenButton.scale.set ( 0.5, 0.5, 0.5 );

		
		this.screensScene.add ( this.scanScreen );
		this.screensScene.add ( this.scanScreenButton );

		this.infoScene = new THREE.Scene ();
		this.infoScene.background = new THREE.Color ( 0x9E9E9E );
		this.infoSceneRenderTarget = new THREE.WebGLRenderTarget ( this.getWidth(), this.getHeight(), { depthBuffer: false, stencilBuffer: false } );

		this.infoScreenTargetPosition = new THREE.Vector3 ( 0, 0, 0 );
		this.infoScreenClosed = true;
		this.infoScreenOpened = false;
		this.infoScreen = new THREE.Mesh ( this.quadGeometry, this.screenMaterial.clone() );
		this.infoScreen.material.uniforms.texture.value = this.infoSceneRenderTarget.texture;

		this.infoScreenButtonMaterial = this.infoScreen.material.clone ();
		this.infoScreenButtonMaterial.vertexShader = shaderHelper.screenButton.vertex;
		this.infoScreenButtonMaterial.fragmentShader = shaderHelper.screenButton.fragment;
		this.infoScreenButtonMaterial.uniforms.texture.value = this.infoSceneRenderTarget.texture;
		this.infoScreenButton = new THREE.Mesh ( this.quadGeometry, this.infoScreenButtonMaterial );
		this.infoScreenButton.scale.set ( 0.5, 0.5, 0.5 );

		this.screensScene.add ( this.infoScreen );
		this.screensScene.add ( this.infoScreenButton );

		// Display the scan screen button also in the info scene

		// this.infoScanButton = new THREE.Mesh ( this.scanScreenButton.geometry.clone (), this.scanScreenButton.material.clone () );

		this.circleMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.circle.vertex,
			fragmentShader: shaderHelper.circle.fragment,

			uniforms: {

				diffuse: { value: [ 0, 0, 0, 1 ] },

			},

			transparent: true,

		} );

		this.scanScreenButton2 = new THREE.Mesh ( this.quadGeometry, this.circleMaterial );
		this.scanScreenButton2.scale.set ( 0.5, 0.5, 0.5 );
		this.infoScene.add ( this.scanScreenButton2 );

		// Render all scenes once the get right matrices.

		this.renderer.render ( this.scanScene, this.mainCamera, this.scanSceneRenderTarget );
		this.renderer.render ( this.infoScene, this.mainCamera, this.infoSceneRenderTarget );
		this.renderer.render ( this.mainScene, this.mainCamera );

		// Add 

		// Declare objects for drawing lines

		this.line = line;
		this.bezier = bezier;
		this.quadratic = quadratic;
		this.basicShader = basicShader;
		this.dynamicBuffer = dynamicBuffer;

		// Objects

		this.player = new THREE.Object3D ();
		this.gameElements = {};

		// End circle

		this.arrivalScaleTarget = 0.4;
		this.endCircleTargetScale = 0.0;
		this.endCircleAlphaTarget = 1.0;
		this.endCircleMaterial = new THREE.ShaderMaterial ( {

			vertexShader: shaderHelper.introEndCircles.vertex,
			fragmentShader: shaderHelper.introEndCircles.fragment,

			uniforms: {

				alpha: { value: 1.0 },
				scale: { value: 1.0 },

			},

			transparent: true,

		} );

		this.endCircle = new THREE.Mesh ( this.quadGeometry, this.endCircleMaterial );
		this.mainScene.add ( this.endCircle );
		
	}

	onMove ( _positions ) {

		this.updateTouches ( _positions );

	}

	onClick ( _positions ) {

		this.updateTouches ( _positions );

	}

	onDrag ( _positions ) {

		this.updateTouches ( _positions );

		// console.log(this.worldTouches);

		// Update screens position according to touches.

		if ( this.activeScreensBoundToTouch.length > 0 ) {

			for ( let i = 0; i < this.activeScreensBoundToTouch.length; i ++ ) {


				// console.log(this.activeScreensBoundToTouch[ i ].touchId);
				if ( this.activeScreensBoundToTouch[ i ].screen == this.scanScreen ) {

					// Brute force

					try {

						this.scanScreenTargetPosition.x = this.worldTouches[ this.activeScreensBoundToTouch[ i ].touchId ].position.x + this.getWorldRight ();

					} catch ( e ) {

						console.log('Brute force error: ' + e);
						
					}

				} 

				if ( this.activeScreensBoundToTouch[ i ].screen == this.infoScreen ) {

					// Brute force

					try {

						this.infoScreenTargetPosition.x = this.worldTouches[ this.activeScreensBoundToTouch[ i ].touchId ].position.x - this.getWorldRight ();
						
					} catch ( e ) {

						console.log('Brute force error: ' + e);

					}

				}

			}

		}	

	}

	onDown ( _positions ) {

		this.touchDown = true;
		this.updateTouches ( _positions );

		if ( !this.levelStarted ) {

			this.levelStarted = true;
			
			// If there is a text intro remove it.

			this.removeTextIntro ();

		}

		// Check if the player has touched a screen button.

		this.activeScreensBoundToTouch = this.checkButtons ();

	}

	onUp ( _positions ) {

		this.touchDown = false;
		this.updateTouches ( _positions );
		this.activeScreensBoundToTouch = [];

	}

	onResize () {
			
		this.mainCamera.aspect = window.innerWidth / window.innerHeight;
	    this.mainCamera.updateProjectionMatrix();

		this.touchDown = false;
	    this.renderer.setSize( window.innerWidth, window.innerHeight );

	    this.scanScreen.material.uniforms.screenDimentions.value = [ this.getWidth(), this.getHeight() ];
		this.scanScreenButton.material.uniforms.screenDimentions.value = [ this.getWidth(), this.getHeight() ];
		this.scanScreenTargetPosition.x = this.getWorldRight() * 2;
		this.scanScreen.scale.x = this.getWorldRight() * 2;

		this.infoScreen.material.uniforms.screenDimentions.value = [ this.getWidth(), this.getHeight() ];
		this.infoScreenButton.material.uniforms.screenDimentions.value = [ this.getWidth(), this.getHeight() ];
		this.infoScreenTargetPosition.x = this.getWorldLeft() * 2;
		this.infoScreen.scale.x = this.getWorldRight() * 2;

	}

	build () {

		// Sound

		this.backgroundSound = this.soundManager.play ( 'Back_sound_' + Math.floor ( Math.random () * 4 ), { loop: -1, volume: 0.7 } ); 
		this.playerSound = this.soundManager.play ( 'Player_sound_0', { loop: -1, volume: 0.05 } );

		// Update screns size & position.

		this.scanScreenTargetPosition.set ( 0.0, 0.0, 0.0 );
		this.scanScreen.position.set ( this.scanScreenTargetPosition.x, this.scanScreenTargetPosition.y, this.scanScreenTargetPosition.z );

		this.scanScreen.scale.x = this.getWorldRight () * 2.0;
		this.scanScreen.scale.y = this.getWorldTop () * 2.0;

		this.infoScreenTargetPosition.set ( 0.0, 0.0, 0.0 );
		this.infoScreen.position.set ( this.infoScreenTargetPosition.x, this.infoScreenTargetPosition.y, this.infoScreenTargetPosition.z );

		this.infoScreen.scale.x = this.getWorldRight () * 2.0;
		this.infoScreen.scale.y = this.getWorldTop () * 2.0;

		// Load a font that will be used for font rendering in the level.

		this.addLoadingObject ();
		bmfontLoader ( './resources/fonts/GT-Walsheim.fnt', function ( err, font ) {

			if ( err ) {

				console.error( err );

			} else {

				this.addLoadingObject ();
				this.objectOnLoad ( 'fnt' );

				let textureLoader = new THREE.TextureLoader ();
				textureLoader.load ( './resources/fonts/GT-Walsheim_sdf.png', function ( texture ) {

					this.objectOnLoad ( 'font texture' );

					// Check if an intro text is specified in the level file.
					// Text intro.

					this.textBackgroundMaterial = new THREE.MeshBasicMaterial ( {

						color: this.infoScene.background,
						opacity: 0.9,
						transparent: true,

					} );

					this.textBackground = new THREE.Mesh ( this.quadGeometry, this.textBackgroundMaterial );
					this.textBackground.material.alphaTarget = 0.9;
					this.textBackground.renderOrder = 5;
					this.textBackground.scale.set ( this.getWorldRight () * 2.0, this.getWorldTop () * 2.0, 3 );
					this.infoScene.add ( this.textBackground );

					let geometry = bmfontGeometry ( {

						width: 1000,
						align: 'center',
						font: font

					} );

					geometry.update ( this.levelFile.textIntro || '' );
					geometry.computeBoundingBox ();

					var material = new THREE.RawShaderMaterial( sdfShader ( {
					  	
					  	map: texture,
					  	side: THREE.DoubleSide,
					  	transparent: true,
					  	color: 'rgb(0, 0, 0)',

					} ) );

					this.textIntro = new THREE.Mesh ( geometry, material );
					this.textIntro.material.alphaTarget = 1.0;
					this.infoScene.add ( this.textIntro );
					this.textIntro.renderOrder = 6;
					geometry.computeBoundingSphere ();
					this.textIntro.position.x -= geometry.boundingSphere.center.x * 0.0030;
					this.textIntro.position.y += geometry.boundingSphere.center.y * 0.0030;
					this.textIntro.rotation.x = Math.PI;
					this.textIntro.scale.set ( 0.0030, 0.0030, 0.0030 );

					// Texts

					this.textsGeometry = bmfontGeometry ( {

						font: font,
						align: 'left',

					} );

					this.textsGeometry.update ( 'Pietro' );

					this.textsMaterial = new THREE.RawShaderMaterial ( sdfShader ( {

						map: texture,
					  	side: THREE.DoubleSide,
					  	transparent: true,
					  	color: 'rgb(0, 0, 0)',

					} ) );

					this.texts = new THREE.Mesh ( this.textsGeometry, this.textsMaterial );
					this.texts.rotation.x = Math.PI;
					this.texts.renderOrder = 3;
					// this.texts.scale.set ( 0.0025, 0.0025, 0.0025 );
					this.infoScene.add ( this.texts );

					this.infoLegendGeometry = bmfontGeometry ( {

						font: font,
						align: 'left',

					} );

					this.fontSizeMultiplier = 0.0024;
					let legend = this.levelFile.legend || '0: Attractors number\n1: Mass average [kg]\n2: Average force on player [N]';
					this.infoLegendGeometry.update ( legend );
					this.infoLegendGeometry.computeBoundingSphere ();
					this.infoLegend = new THREE.Mesh ( this.infoLegendGeometry, this.textsMaterial );
					this.infoLegend.position.x -= this.infoLegendGeometry.boundingSphere.center.x * 0.0025;
					this.infoLegend.rotation.x = Math.PI;
					this.infoLegend.scale.set ( this.fontSizeMultiplier, this.fontSizeMultiplier, this.fontSizeMultiplier );
					this.infoScene.add ( this.infoLegend );

					this.render ();

					let offset = 0.3;
					this.infoLegend.position.set ( this.getWorldLeft () + offset, this.getWorldBottom () + offset, 0 );

				}.bind ( this ) );

			} 

		}.bind ( this ) );

		// Add the goals elements.

		this.addElement ( 'arrival', {

			static: false,
			manualMode: false,
			transparent: true,
			individual: false,
			maxInstancesNum: 1,
			renderOrder: 0,

			shaders: {

				main: null,

				normal: {

					name: 'arrival',
					blending: 'NormalBlending',
					uniforms: {

						solidColor: { value: [ 0.8, 0.8, 0.8, 1.0 ] },

					},

					transparent: true,

				},

				scan: null,
				infos: null,

			},

			instances: {

				0: {

					enabled: true,
					name: 'top',
					position: vec3.fromValues ( 0, this.getWorldTop () - 0.5, 0 ),
					rotation: vec3.fromValues ( 0.0, 0.0, 0.0 ),
					scale: vec3.fromValues ( 0.4, 0.4, 0.5 ),

				},

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

		this.addElement ( 'player', {

			elementType: 'Player',
			isMainPlayer: true,
			static: false,
			individual: true,
			manualMode: false,
			renderingOrder: 10,

			shaders: {

				main: null,

				normal: {

					name: 'player',
					transparent: true,
					blending: 'MultiplyBlending',
					textureUrl: './resources/textures/generic_circle_sdf.png',
					uniforms: {},

				},

				scan: {

					name: 'playerScan',
					transparent: true,
					textureUrl: './resources/textures/generic_circle_sdf.png',
					uniforms: {},

				},

				infos: {

					name: 'playerInfo',
					transparent: true,
					textureUrl: './resources/textures/generic_circle_sdf.png',
					uniforms: {},

				},

			},

			instances: {

				0: {

					enabled: false,
					position: vec3.fromValues ( 0, 10, 0 ),
					rotation: vec3.fromValues ( 0.0, 0.0, 0.0 ),
					scale: vec3.fromValues ( 0.12, 0.12, 1.0 ),
					velocity: vec3.create(),
					mass: 30000,
					drag: this.levelFile.playerDrag || 0.999999,

				}

			}

		} );

		// Player particles

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

		this.mainScene.add ( this.particlesPoints );

		// Build a base grid to draw infos.

		this.baseGridX = 7;
		this.baseGridY = 20;

		let gridGeometry = new THREE.PlaneBufferGeometry ( this.getWorldRight () * 2.0, this.getWorldTop () * 2.0, this.baseGridX - 1, this.baseGridY - 1 );
		let gridMaterialDebug = new THREE.MeshBasicMaterial ( {

			color: 0x000000,
			wireframe: true,

		} );

		let gridDebug = new THREE.Mesh ( gridGeometry, gridMaterialDebug );
		// this.infoScene.add ( gridDebug );
		this.baseGrid = gridGeometry.attributes.position.array;

		let arrowHeadTextureLoader = new THREE.TextureLoader().load ( './resources/textures/Arrow_Head_sdf.png', function ( texture ) {

			this.infoArrow = new THREE.Object3D ();
			this.arrowHeadMaterial = new THREE.MeshBasicMaterial ( {

				map: texture,
				color: 'rgb(0, 0, 0)',
				transparent: true,

			} );

			this.arrowLineMaterial = new THREE.ShaderMaterial( {

				vertexShader: shaderHelper.arrowLine.vertex,
				fragmentShader: shaderHelper.arrowLine.fragment,
				transparent: true,

			} );

			this.arrowHead = new THREE.Mesh ( this.quadGeometry, this.arrowHeadMaterial );
			this.arrowHead.scale.set ( 0.0000001, 0.0000001, 0.0000001 );
			this.arrowLine = new THREE.Mesh ( this.quadGeometry, this.arrowLineMaterial );
			this.arrowLine.scale.set ( 0.01, 0.0000001, 0.0000001 );
			this.infoArrow.add ( this.arrowHead );
			this.infoArrow.add ( this.arrowLine );
			this.infoScene.add ( this.infoArrow );

		}.bind ( this ) );

		// Add lines

		this.onLoad ( function () {

			this.updateTextPoints ();
			let linesData = this.getLinesData ();

			this.linesGeometry = new THREE.BufferGeometry ();
			this.linesGeometry.setIndex ( new THREE.BufferAttribute ( new Uint32Array ( linesData.index ), 1 ) );
			this.linesGeometry.index.dynamic = true;
			this.linesGeometry.addAttribute ( 'position', new THREE.BufferAttribute ( new Float32Array ( linesData.position ), 3 ) );
			this.linesGeometry.attributes.position.dynamic = true;
			this.linesGeometry.addAttribute ( 'lineNormal', new THREE.BufferAttribute ( new Float32Array ( linesData.lineNormal ), 2 ) );
			this.linesGeometry.attributes.lineNormal.dynamic = true;
			this.linesGeometry.addAttribute ( 'lineMiter', new THREE.BufferAttribute ( new Float32Array ( linesData.lineMiter ), 1 ) );
			this.linesGeometry.attributes.lineMiter.dynamic = true;
			this.linesGeometry.addAttribute ( 'lineOpacity', new THREE.BufferAttribute ( new Float32Array ( linesData.lineOpacity ), 1 ) );
			this.linesGeometry.attributes.lineOpacity.dynamic = true;

			let m = new THREE.ShaderMaterial ( {

				vertexShader: shaderHelper.line.vertex,
				fragmentShader: shaderHelper.line.fragment,
				side: THREE.DoubleSide,

				uniforms: {

					diffuse: { value: [ 0, 0, 0 ] },
					thickness: { value: 0.06 },

				},

				transparent: true,

			} );

			this.lines = new THREE.Mesh ( this.linesGeometry, m );
			this.lines.renderOrder = 2;
			this.infoScene.add ( this.lines );

			// Render all once when oll is loaded.

			setTimeout ( function () {

				this.update (); // force update.

				this.renderer.clearDepth();
				this.renderer.clear ();

				this.renderer.render ( this.mainScene, this.mainCamera );
				this.renderer.render ( this.scanScene, this.mainCamera, this.scanSceneRenderTarget );
				this.renderer.render ( this.infoScene, this.mainCamera, this.infoSceneRenderTarget );

				this.renderer.clearDepth();
				this.renderer.render( this.screensScene, this.mainCamera );

			}.bind ( this ), 0 );

			this.scanScreenButton2.position.x = this.getWorldRight ();

		}.bind ( this ) );

	}

	addElement ( _name, _element ) {

		this.addLoadingObject ();
		this.elementToLoad ++;

		let textureUrl = _element.texture;
		let shaders = _element.shaders;
		let instances = _element.instances;

		let gameObjectInstances = [];

		// For static objects just pack all the objects in a single buffer geometry to optimize rendering.

		if ( _element.static ) {

			// Build a geometry composed with quads.

			let vertices = [];
			let colors = [];
			let uvs = [];
			let indices = [];

			// Check all instances of this object and fill the single buffer geometry with data.

			for ( let instanceIndex in instances ) {

				let instance = instances[ instanceIndex ];

				// Create a game element to keep track of the three elements.

				if ( _element.elementType ) {

					let gameElement = new library[ _element.elementType ] ( instance );
					gameObjectInstances.push ( gameElement );
					
				} else {

					let gameElement = new library.PhysicalElement ( instance );
					gameObjectInstances.push ( gameElement );

				}

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

				// HAAAACKKKKKKK

				if ( _name == 'planets' ) {

					for ( let i = 0; i < quad.vertices.length; i += 3 ) {

						vertices.push ( quad.vertices[ i + 0 ] );
						vertices.push ( quad.vertices[ i + 1 ] );
						vertices.push ( instance.scale[ 0 ] );

					}

				} else {

					for ( let i = 0; i < quad.vertices.length; i ++ ) {

						vertices.push ( quad.vertices[ i ] );

					}

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
			
			let mainMesh = new THREE.Mesh ( geometry );
			let normalMesh = new THREE.Mesh ( geometry );
			let scanMesh = new THREE.Mesh ( geometry );
			let infoMesh = new THREE.Mesh ( geometry );

			// Encapsulate the final step of the object creation in order to keep track of all elements.
			// As the getElementMaterial is asyncronous we must be sure that all values remains the same.

			( function ( _name, _element, _gameObjectInstances ) {

				this.getElementMaterial ( _element, function ( materials ) {

					this.addMeshes ( _element, {

						mainMesh: mainMesh,
						normalMesh: normalMesh,
						scanMesh: scanMesh,
						infoMesh: infoMesh,

					}, materials );

					this.gameElements[ _name ] = {};
					for ( let property in _element ) {

						this.gameElements[ _name ][ property ] = _element[ property ];

					}

					// Override instances with newly created game objects

					this.gameElements[ _name ].mainGeometry = this.gameElements[ _name ].meshes[ 0 ].geometry;
					this.gameElements[ _name ].instances = _gameObjectInstances;
					this.objectOnLoad ( _name );

				}.bind ( this ) );

			}.bind ( this ) )( _name, _element, gameObjectInstances );

		} else {

			// If individual
			// Just add a quad with the texture mapped on it.

			if ( _element.individual ) {

				let instances = _element.instances;

				_element.instances = [];

				for ( let instanceIndex in instances ) {

					let instance = instances[ instanceIndex ];

					// Create a game element.

					if ( _element.elementType ) {

						let gameElement = new library[ _element.elementType ] ( instance );
						gameObjectInstances.push ( gameElement );
						
					} else {

						let gameElement = new library.PhysicalElement ( instance );
						gameObjectInstances.push ( gameElement );

					}

					// Create a mesh to display the object.

					let planeGeometry = new THREE.PlaneGeometry ( 1, 1 );

					let mainMesh = new THREE.Mesh ( planeGeometry );
					let normalMesh = new THREE.Mesh ( planeGeometry );
					let scanMesh = new THREE.Mesh ( planeGeometry );
					let infoMesh = new THREE.Mesh ( planeGeometry );

					mainMesh.position.set ( instance.position[ 0 ], instance.position[ 1 ], instance.position[ 2 ] );
					normalMesh.position.set ( instance.position[ 0 ], instance.position[ 1 ], instance.position[ 2 ] );
					scanMesh.position.set ( instance.position[ 0 ], instance.position[ 1 ], instance.position[ 2 ] );
					infoMesh.position.set ( instance.position[ 0 ], instance.position[ 1 ], instance.position[ 2 ] );

					mainMesh.rotation.set ( instance.rotation[ 0 ], instance.rotation[ 1 ], instance.rotation[ 2 ] );
					normalMesh.rotation.set ( instance.rotation[ 0 ], instance.rotation[ 1 ], instance.rotation[ 2 ] );
					scanMesh.rotation.set ( instance.rotation[ 0 ], instance.rotation[ 1 ], instance.rotation[ 2 ] );
					infoMesh.rotation.set ( instance.rotation[ 0 ], instance.rotation[ 1 ], instance.rotation[ 2 ] );

					mainMesh.scale.set ( instance.scale[ 0 ], instance.scale[ 1 ], instance.scale[ 2 ] );
					normalMesh.scale.set ( instance.scale[ 0 ], instance.scale[ 1 ], instance.scale[ 2 ] );
					scanMesh.scale.set ( instance.scale[ 0 ], instance.scale[ 1 ], instance.scale[ 2 ] );
					infoMesh.scale.set ( instance.scale[ 0 ], instance.scale[ 1 ], instance.scale[ 2 ] );
					
					// Encapsulate the final step of the object creation in order to keep track of all elements.
					// As the getElementMaterial is asyncronous we must be sure that all values remains the same.

					( function ( _name, _element, _gameObjectInstances ) {

						this.getElementMaterial ( _element, function ( materials ) {

							this.addMeshes ( _element, {

								mainMesh: mainMesh,
								normalMesh: normalMesh,
								scanMesh: scanMesh,
								infoMesh: infoMesh,

							}, materials );

							this.gameElements[ _name ] = {};
							for ( let property in _element ) {

								this.gameElements[ _name ][ property ] = _element[ property ];

							}

							// Override instances with newly created game objects

							this.gameElements[ _name ].mainGeometry = this.gameElements[ _name ].meshes[ 0 ].geometry;
							this.gameElements[ _name ].instances = _gameObjectInstances;
							this.objectOnLoad ( _name );

						}.bind ( this ) );

					}.bind ( this ) )( _name, _element, gameObjectInstances );

				}

			} 

			// Here we pack multiple dynamic instances in one buffer and we will update them at runtime.

			else {

				// Create a geometry that will hold all the instances.
				// The transform will happen on the gpu to optimize the render loop.

				let maxInstancesNum = _element.maxInstancesNum;
				let geometryData = null;

				if ( _element.buildFromInstances ) {

					geometryData = this.getDataGeometryFromInstances ( Object.keys ( _element.instances ).map( key => _element.instances[ key ] ) );

				} else {

					geometryData = this.getDataGeometryFromNum ( maxInstancesNum );

				}

				let geometry = new THREE.BufferGeometry ();

				let indexAttrib = new THREE.BufferAttribute ( new Uint32Array ( geometryData.indices ), 1 );
				let positionAttrib = new THREE.BufferAttribute ( new Float32Array ( geometryData.vertices ), 3 );
				let colorAttrib = new THREE.BufferAttribute ( new Float32Array ( geometryData.colors ), 4 );
				colorAttrib.dynamic = true;
				let uvAttrib = new THREE.BufferAttribute ( new Float32Array ( geometryData.uvs ), 2 );

				// Here we pass transform informations to the shader
				// x: pos.x
				// y: pos.y
				// z: radius
				// w: rotation.z

				let transformAttrib = new THREE.BufferAttribute ( new Float32Array ( geometryData.transform ), 4 );
				transformAttrib.dynamic = true;

				geometry.setIndex ( indexAttrib );
				geometry.addAttribute ( 'position', positionAttrib );
				geometry.addAttribute ( 'rgbaColor', colorAttrib );
				geometry.addAttribute ( 'uv', uvAttrib );
				geometry.addAttribute ( 'transform', transformAttrib );

				let mainMesh = new THREE.Mesh ( geometry );
				let normalMesh = new THREE.Mesh ( geometry );
				let scanMesh = new THREE.Mesh ( geometry );
				let infoMesh = new THREE.Mesh ( geometry );
				
				let instances = _element.instances;

				for ( let instanceIndex in instances ) {

					let instance = instances[ instanceIndex ];

					// Create a game element.

					if ( _element.elementType ) {

						let gameElement = new library[ _element.elementType ] ( instance );
						gameObjectInstances.push ( gameElement );
						
					} else {

						let gameElement = new library.PhysicalElement ( instance );
						gameObjectInstances.push ( gameElement );

					}

				}

				// Encapsulate the final step of the object creation in order to keep track of all elements.
				// As the getElementMaterial is asyncronous we must be sure that all values remains the same.

				( function ( _name, _element, _gameObjectInstances ) {

					this.getElementMaterial ( _element, function ( materials ) {

						this.addMeshes ( _element, {

							mainMesh: mainMesh,
							normalMesh: normalMesh,
							scanMesh: scanMesh,
							infoMesh: infoMesh,

						}, materials );

						this.gameElements[ _name ] = {};
						for ( let property in _element ) {

							this.gameElements[ _name ][ property ] = _element[ property ];

						}

						// Override instances with newly created game objects

						this.gameElements[ _name ].mainGeometry = this.gameElements[ _name ].meshes[ 0 ].geometry;
						this.gameElements[ _name ].instances = _gameObjectInstances;
						this.objectOnLoad ( _name );

					}.bind ( this ) );

				}.bind ( this ) )( _name, _element, gameObjectInstances ); 

			}

		}		

	}

	addInstanceOf ( _name, _instance ) {

		let gameElement = this.gameElements[ _name ];
		let newInstance = new library[ gameElement.elementType ]( _instance );
		
		if ( gameElement.instances.length < gameElement.maxInstancesNum ) {

			gameElement.instances.push ( newInstance );

		}

		return newInstance;

	}

	getInstanceByName ( _nameElement, _nameInstance ) {

		for ( let i = 0; i < this.gameElements[ _nameElement ].instances.length; i++ ) {

			if ( this.gameElements[ _nameElement ].instances[ i ].name == _nameInstance ) {

				return this.gameElements[ _nameElement ].instances[ i ];

			}

		}

	}

	// This function adds meshes to all of the layers.

	addMeshes ( _element, _meshes, _materials ) {

		if ( _element ) _element.meshes = [];

		if ( _materials.main ) {

			_meshes.mainMesh.material = _materials.main;
			this.mainScene.add ( _meshes.mainMesh );
			this.scanScene.add ( _meshes.mainMesh );
			this.infoScene.add ( _meshes.mainMesh );

			if ( _element ) _element.meshes.push ( _meshes.mainMesh );

		} else {

			if ( _materials.normal ) {

				_meshes.normalMesh.material = _materials.normal;
				_meshes.normalMesh.renderOrder = _element.renderOrder || 0;
				this.mainScene.add ( _meshes.normalMesh );

				if ( _element ) _element.meshes.push ( _meshes.normalMesh );

			} 

			if ( _materials.scan ) {

				_meshes.scanMesh.material = _materials.scan;
				_meshes.scanMesh.renderOrder = _element.renderOrder || 0;
				this.scanScene.add ( _meshes.scanMesh );

				if ( _element ) _element.meshes.push ( _meshes.scanMesh );

			}

			if ( _materials.infos ) {

				_meshes.infoMesh.material = _materials.infos;
				_meshes.infoMesh.renderOrder = _element.renderOrder || 0;
				this.infoScene.add ( _meshes.infoMesh );

				if ( _element ) _element.meshes.push ( _meshes.infoMesh );

			}

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
		mat4.rotateX ( modelMatrix, modelMatrix, rotation[ 0 ], [ 1, 0, 0 ] );
		mat4.rotateY ( modelMatrix, modelMatrix, rotation[ 1 ], [ 0, 1, 0 ] );
		mat4.rotateZ ( modelMatrix, modelMatrix, rotation[ 2 ], [ 0, 0, 1 ] );
		mat4.scale ( modelMatrix, modelMatrix, scale );

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

	getDataGeometryFromNum ( _num ) {

		let indices = [];
		let vertices = [];
		let colors = [];
		let uvs = [];
		let transform = [];

		for ( let i = _num - 1; i >= 0; i -- ) {

			// Update the indices

			for ( let j = 0; j < this.genericQuad.indices.length; j ++ ) {

				indices.push ( this.genericQuad.indices[ j ] + vertices.length / 3 );

			}

			// Update vertices

			for ( let j = 0; j < this.genericQuad.vertices.length; j += 3 ) {

				vertices.push ( this.genericQuad.vertices[ j + 0 ] );
				vertices.push ( this.genericQuad.vertices[ j + 1 ] );
				vertices.push ( this.genericQuad.vertices[ j + 2 ] ); // Hack pass the y scale

			}

			// Update uvs

			for ( let j = 0; j < this.genericQuad.uvs.length; j ++ ) {

				uvs.push ( this.genericQuad.uvs[ j ] );

			}

			// Update colors

			for ( let j = 0; j < 4; j ++ ) {

				colors.push ( 1.0 );
				colors.push ( 1.0 );
				colors.push ( 1.0 );
				colors.push ( 1.0 );

				transform.push ( 0.0 );
				transform.push ( 0.0 );
				transform.push ( 0.0 );
				transform.push ( 0.0 );

			}

		}

		return {

			indices: indices,
			vertices: vertices,
			colors: colors,
			uvs: uvs,
			transform: transform,

		}

	}

	getDataGeometryFromInstances ( _instances ) {

		let indices = [];
		let vertices = [];
		let colors = [];
		let uvs = [];
		let transform = [];

		for ( let i = _instances.length - 1; i >= 0; i -- ) {

			let instance = _instances[ i ];

			// Set default variables if missing.

			instance.position = instance.position || vec3.fromValues ( 0.0, 0.0, 0.0 );
			instance.rotation = instance.rotation || vec3.fromValues ( 0.0, 0.0, 0.0 );
			instance.scale = instance.scale || vec3.fromValues ( 1.0, 1.0, 1.0 );
			instance.color = instance.color || vec4.fromValues ( 1.0, 1.0, 1.0, 1.0 );

			// Update the indices

			for ( let j = 0; j < this.genericQuad.indices.length; j ++ ) {

				indices.push ( this.genericQuad.indices[ j ] + vertices.length / 3 );

			}

			// Update vertices

			for ( let j = 0; j < this.genericQuad.vertices.length; j += 3 ) {

				vertices.push ( this.genericQuad.vertices[ j + 0 ] );
				vertices.push ( this.genericQuad.vertices[ j + 1 ] );
				vertices.push ( _instances[ i ].scale[ 1 ] ); // Hack pass the y scale

			}

			// Update uvs

			for ( let j = 0; j < this.genericQuad.uvs.length; j ++ ) {

				uvs.push ( this.genericQuad.uvs[ j ] );

			}

			// Update colors

			for ( let j = 0; j < 4; j ++ ) {

				colors.push ( instance.color[ 0 ] );
				colors.push ( instance.color[ 1 ] );
				colors.push ( instance.color[ 2 ] );
				colors.push ( instance.color[ 3 ] );

				transform.push ( instance.position[ 0 ] );
				transform.push ( instance.position[ 1 ] );
				transform.push ( instance.scale[ 0 ] );
				transform.push ( instance.rotation[ 2 ] || 0 );

			}

		}

		return {

			indices: indices,
			vertices: vertices,
			colors: colors,
			uvs: uvs,
			transform: transform,

		}

	}

	updateTextPoints () {

		let nPos = 5;
		this.offsetTop = this.offsetTop || 1.4;
		let offsetSides = 0.8;
		this.offsetBottom = this.offsetBottom || 1.5;

		let topLine = [];
		let bottomLine = [];
		let width = this.getWorldRight () * 2;
		let step = ( width - 2 * offsetSides ) * ( 1.0 / ( nPos - 1 ) );

		for ( let i = 0; i < nPos; i ++ ) {

			topLine.push ( [ i * step - ( width - 2 * offsetSides ) * 0.5 - 0.3, this.getWorldTop () - this.offsetTop ] );
			bottomLine.push ( [ i * step - ( width - 2 * offsetSides ) * 0.5 - 0.3, this.getWorldBottom () + this.offsetBottom ] );

		}

		for ( let element in this.gameElements ) {

			if ( this.gameElements[ element ].drawInfos ) { // Check if we have to draw info related to this object
				
				let instances = this.gameElements[ element ].instances;
				let maxInstancesNum = this.gameElements[ element ].maxInstancesNum || 0;

				// Create or overide an object to store where the text should be located

				this.gameElements[ element ].textPoints = {};

				for ( let i = 0; i < nPos; i ++ ) {

					// Check wich of the two lines of points must be uset to display the inormations.

					let line = [];
					this.gameElements[ element ].lineInfo = this.gameElements[ element ].lineInfo || 'top'; // Set default value if not specified;

					if ( this.gameElements[ element ].lineInfo == 'top' ) {

						line = topLine;
						this.gameElements[ element ].textPoints[ i ] = { point: line[ i ], instances: [] };

					} else if ( this.gameElements[ element ].lineInfo == 'bottom' ) {

						line = bottomLine;
						this.gameElements[ element ].textPoints[ i ] = { point: line[ i ], instances: [] };
						
					}

					// Check where a certain instance's information must be displayed.
					// Get the lines informations out of the positions retrieved here. 

					for ( let j = 0; j < instances.length; j ++ ) {

						let instance = instances[ j ];

						if ( typeof instance.manualPointIndex == 'number' ) { // Check if a fixed point is defined.

							// Add this instance only when the actual textPoint is defined.

							if ( i == instance.manualPointIndex ) {

								this.gameElements[ element ].textPoints[ i ].instances.push ( instances[ j ] );

							}

						} else {

							// Here we first check the extreme points in order to always have a text point.
							// Then we check the nearest point in the line array.

							if ( i == 0 && instance.position[ 0 ] <= line[ i ][ 0 ] ) {

								this.gameElements[ element ].textPoints[ i ].instances.push ( instances[ j ] );
								
							} else if ( i == line.length - 1 && instance.position[ 0 ] >= line[ i ][ 0 ] ) {

								this.gameElements[ element ].textPoints[ i ].instances.push ( instances[ j ] );

							} else {

								let xDist = Math.abs ( instance.position[ 0 ] - line[ i ][ 0 ] );
								if ( xDist <= step * 0.5 ) {

									this.gameElements[ element ].textPoints[ i ].instances.push ( instances[ j ] );

								}

							} 

						}
							
					}

				}

			}

		}

	}

	getLinesData () {

		let linesIndices = [];
		let linesPositions = [];
		let linesNormals = [];
		let linesMiters = [];
		let linesOpacities = [];

		// As we update in two different ways the arrays - with instance and without - we declare a function not to repeat ourself.

		let self = this;

		function updateArrays ( _iPoint, _tPoint, _cPoint, _opacity ) {

			let linePoints = self.quadratic ( _iPoint, _cPoint, _tPoint, 0 );
			let lineGeometry = self.generateLine ( linePoints );

			for ( let j = 0; j < lineGeometry.index.length; j ++ ) {

				linesIndices.push ( lineGeometry.index[ j ] + linesPositions.length / 3 );

			}

			for ( let j = 0; j < lineGeometry.position.length; j ++ ) {

				linesPositions.push ( lineGeometry.position[ j ] );

			}

			for ( let j = 0; j < lineGeometry.lineNormal.length; j ++ ) {

				linesNormals.push ( lineGeometry.lineNormal[ j ] );

			}

			for ( let j = 0; j < lineGeometry.lineMiter.length; j ++ ) {

				linesMiters.push ( lineGeometry.lineMiter[ j ] );
				linesOpacities.push ( _opacity );

			}

		}

		// Pass throw all elements and check if they need to display infos.

		for ( let element in this.gameElements ) {

			if ( this.gameElements[ element ].drawInfos && this.gameElements[ element ].textPoints ) {

				// As we work with some fixed size buffers we'll pass trougth all max num instances.

				let maxInstancesNum = this.gameElements[ element ].maxInstancesNum;
				let instances = this.gameElements[ element ].instances;
				let textPoints = this.gameElements[ element ].textPoints;
			
				for ( let i = 0; i < maxInstancesNum; i ++ ) {

					if ( i < instances.length ) {

						let instance = instances[ i ];

						// Check in which text point object the actual instance has been stored.

						for ( let p in textPoints ) {

							if ( contains.call ( textPoints[ p ].instances, instance ) ) {

								let iPoint = [ instance.position[ 0 ], instance.position[ 1 ] ];
								let tPoint = textPoints[ p ].point;

								// Reset the iPoint to the edge of the element - not the middle.
								// Offset if slightly as the circles are not perfectly round.

								let dir = vec2.sub ( [ 0, 0 ], tPoint, iPoint );
								vec2.normalize ( dir, dir );
								iPoint[ 0 ] += ( dir[ 0 ] * instance.scale[ 0 ] ) * 0.97;
								iPoint[ 1 ] += ( dir[ 1 ] * instance.scale[ 1 ] ) * 0.97;

								let cPoint = [ tPoint[ 0 ] + ( iPoint[ 0 ] - tPoint[ 0 ] ) * 0.8, tPoint[ 1 ] ];

								updateArrays ( iPoint, tPoint, cPoint, instance.lifePercent * 0.4 );

								break;

							}

						}

					} else {

						updateArrays ( [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ], 0 );

					}

				} 
				
			}

		}

		return {

			index: linesIndices,
			position: linesPositions,
			lineNormal: linesNormals,
			lineMiter: linesMiters,
			lineOpacity: linesOpacities,

		}

	}

	generateLine ( path, closed ) {

		path = path || [];
	    let normals = getNormals ( path, closed );
	    let indexCount = Math.max ( 0, ( path.length - 1 ) * 6 );

	    let count = path.length * 2;
	    let attrPosition = new Float32Array ( count * 3 );
	    let attrNormal = new Float32Array ( count * 2 );
	    let attrMiter = new Float32Array ( count );
	    let attrIndex = new Uint32Array ( indexCount );

	    let index = 0;
	    let c = 0;
	    let dIndex = 0;
	    let indexArray = attrIndex;

	    path.forEach ( function ( point, pointIndex, list ) {

	      	let i = index;
	      	indexArray[ c++ ] = i / 3 + 0;
	      	indexArray[ c++ ] = i / 3 + 1;
	      	indexArray[ c++ ] = i / 3 + 2;
	      	indexArray[ c++ ] = i / 3 + 2;
	      	indexArray[ c++ ] = i / 3 + 1;
	      	indexArray[ c++ ] = i / 3 + 3;
	
	      	attrPosition[ index++ ] = point[ 0 ];
	      	attrPosition[ index++ ] = point[ 1 ];
	      	attrPosition[ index++ ] = 0;
	      	attrPosition[ index++ ] = point[ 0 ];
	      	attrPosition[ index++ ] = point[ 1 ];
	      	attrPosition[ index++ ] = 0;

	    });

	    let nIndex = 0;
	    let mIndex = 0;

	    normals.forEach ( function ( n ) {

	      	let norm = n[ 0 ];
	      	let miter = n[ 1 ];

	      	attrNormal[ nIndex++ ] = norm[ 0 ];
	      	attrNormal[ nIndex++ ] = norm[ 1 ];
	      	attrNormal[ nIndex++ ] = norm[ 0 ];
	      	attrNormal[ nIndex++ ] = norm[ 1 ];

	      	attrMiter[ mIndex++ ] = -miter;
	      	attrMiter[ mIndex++ ] = miter;

	    });

	    return {

	    	position: attrPosition,
	    	lineNormal: attrNormal,
	    	lineMiter: attrMiter,
	    	index: attrIndex,

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

							let uniforms = shader.uniforms || {};
							uniforms.texture = { value: texture };

							materials[ type ] = new THREE.ShaderMaterial ( {

								vertexShader: shaderHelper[ shader.name ].vertex,
								fragmentShader: shaderHelper[ shader.name ].fragment,
								uniforms: uniforms,

								transparent: shader.transparent || false,
								depthWrite: _element.depthWrite || false,
								depthTest: _element.depthTest || false,

								blending: THREE[ shader.blending ] || THREE.NormalBlending,

							} );

							// Activate OES_standard_derivatives

							materials[ type ].extensions.derivatives = true;

							numShaders --;
							checkLoad ();

						} );

					} )( shader );

				} else {

					materials[ type ] = new THREE.ShaderMaterial ( {

						vertexShader: shaderHelper[ shader.name ].vertex,
						fragmentShader: shaderHelper[ shader.name ].fragment,
						uniforms: shader.uniforms,
						
						blending: THREE[ shader.blending ] || THREE.NormalBlending,

						transparent: shader.transparent || false,
						depthWrite: _element.depthWrite || false,
						depthTest: _element.depthTest || false,

					} );

					// Activate OES_standard_derivatives

					materials[ type ].extensions.derivatives = true;

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

	initPlayer ( _numInstances, _options ) {

		this.resetPlayer ( _numInstances, _options );

	}

	resetPlayer ( _numInstances, _options ) {

		

	}

	makeTextSprite( message, parameters ) {

		function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill(); ctx.stroke(); }

        if ( parameters === undefined ) parameters = {};
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
        var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
        var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        var metrics = context.measureText( message );
        var textWidth = metrics.width;

        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

        context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
        context.fillText( message, borderThickness, fontsize + borderThickness);

        var texture = new THREE.Texture(canvas) 
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
        return sprite; 

    }

	sign ( p1, p2,  p3 ){

	    return (p1[ 0 ] - p3[ 0 ]) * (p2[ 1 ] - p3[ 1 ]) - (p2[ 0 ] - p3[ 0 ]) * (p1[ 1 ] - p3[ 1 ]);

	}

	isInBox ( _instance, _pt ) {

		let v = [];

		v.push ( vec3.fromValues ( -1.0, -1.0, 0.0 ) );
		v.push ( vec3.fromValues ( 1.0, -1.0, 0.0 ) );
		v.push ( vec3.fromValues ( 1.0, 1.0, 0.0 ) );
		v.push ( vec3.fromValues ( -1.0, 1.0, 0.0 ) );

		let modelMatrix = mat4.create();
		mat4.translate ( modelMatrix, modelMatrix, _instance.position );
		mat4.rotateX ( modelMatrix, modelMatrix, _instance.rotation[ 0 ] );
		mat4.rotateY ( modelMatrix, modelMatrix, _instance.rotation[ 1 ] );
		mat4.rotateZ ( modelMatrix, modelMatrix, _instance.rotation[ 2 ] );
		mat4.scale ( modelMatrix, modelMatrix, _instance.scale );

		for ( let i = 0; i < 4; i ++ ) {

			vec3.transformMat4 ( v[ i ], v[ i ], modelMatrix );

		}

	    let b1, b2, b3;

	    b1 = this.sign( _pt, v[ 0 ], v[ 1 ] ) < 0.0;
	    b2 = this.sign( _pt, v[ 1 ], v[ 2 ] ) < 0.0;
	    b3 = this.sign( _pt, v[ 2 ], v[ 0 ] ) < 0.0;


	    if ( (b1 == b2) && (b2 == b3) ) {

	    	return true;

	    } else {

	    	b1 = this.sign( _pt, v[ 0 ], v[ 2 ] ) < 0.0;
	    	b2 = this.sign( _pt, v[ 2 ], v[ 3 ] ) < 0.0;
	    	b3 = this.sign( _pt, v[ 3 ], v[ 0 ] ) < 0.0;

	    }

	    return (b1 == b2) && (b2 == b3);
	    
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

	checkEdges ( _vector, _offset ) {

		_offset = _offset || 0;

		if ( _vector[ 0 ] > this.getWorldRight () + _offset || _vector[ 0 ] < this.getWorldLeft () - _offset || _vector[ 1 ] > this.getWorldTop () + _offset || _vector[ 1 ] < this.getWorldBottom () - _offset ) return true;
		return false; 

	}

	updateTouches ( _positions ) {

		_positions.sort ( function ( a, b ) {

			return a.id - b.id;

		} );

		this.touches = {};
		this.worldTouches = {};
		this.glTouches = {};
		this.glWorldTouches = {};

		for ( let i = 0; i < _positions.length; i ++ ) {

			this.touches[ _positions[ i ].id ] = { id: _positions[ i ].id, position: new THREE.Vector2 ( _positions[ i ].x * this.renderer.getPixelRatio (), _positions[ i ].y * this.renderer.getPixelRatio () ) };
			this.glTouches[ _positions[ i ].id ] = { id: _positions[ i ].id, position: [ _positions[ i ].x * this.renderer.getPixelRatio (), _positions[ i ].y * this.renderer.getPixelRatio () ] };

			let worldTouch = this.getWorldTouch ( this.touches[ _positions[ i ].id ].position );
			this.worldTouches[ _positions[ i ].id ] = { id: _positions[ i ].id, position: new THREE.Vector3 ( worldTouch[ 0 ], worldTouch[ 1 ], worldTouch[ 2 ] ) };
			this.glWorldTouches[ _positions[ i ].id ] = { id: _positions[ i ].id, position: worldTouch };

		}

	}

	getWorldTouch ( _touch ) {

		let touchWorld = this.get3DPointOnBasePlane ( _touch );
		return [ touchWorld.x, touchWorld.y, touchWorld.z ];

	}

	get3DPointOnBasePlane ( _vector ) {

		let vector = new THREE.Vector3();
		vector.set( ( _vector.x / this.getWidth() ) * 2 - 1, - ( _vector.y / this.getHeight() ) * 2 + 1, 0.5 );
		vector.unproject( this.mainCamera );
		let dir = vector.sub( this.mainCamera.position ).normalize();
		let distance = - this.mainCamera.position.z / dir.z;

		return this.mainCamera.position.clone().add( dir.multiplyScalar( distance ) );

	}

	get2DPos ( _vector ) {

		let width = this.getWidth (), height = this.getHeight ();
		let widthHalf = width / 2, heightHalf = height / 2;

		let pos = _vector.clone();
		pos.project(this.mainCamera);
		pos.x = ( pos.x * widthHalf ) + widthHalf;
		pos.y = - ( pos.y * heightHalf ) + heightHalf;

		return pos;

	}

	checkButtons () {

		let screensBoundToTouch = [];

		for ( let touch in this.worldTouches ) {

			let currentTouch = this.worldTouches[ touch ];

			let distToScanButton = currentTouch.position.distanceTo ( this.scanScreenButton.position );
			let onScan = false;

			if ( distToScanButton < this.scanScreenButton.scale.x * 1.0 ) {

				onScan = true;

			}

			let distToInfoButton = currentTouch.position.distanceTo ( this.infoScreenButton.position );
			let onInfo = false;

			if ( distToInfoButton < this.infoScreenButton.scale.x * 1.0 ) {

				onInfo = true;

			}

			// Check where the screens are to make an intuitive interaction when they are overlapping.

			if ( onScan && onInfo && !this.scanScreenOpened ) {

				if ( onInfo ) screensBoundToTouch.push ( { screen: this.infoScreen, touchId: currentTouch.id } );  

			} else if ( onScan && onInfo && this.scanScreenOpened ) {

				if ( onScan ) screensBoundToTouch.push ( { screen: this.scanScreen, touchId: currentTouch.id } );				

			} else if ( onScan && !onInfo ) {

				if ( onScan ) screensBoundToTouch.push ( { screen: this.scanScreen, touchId: currentTouch.id } );

			} else if ( !onScan && onInfo ) {

				if ( onInfo ) screensBoundToTouch.push ( { screen: this.infoScreen, touchId: currentTouch.id } );  

			}

		}

		return screensBoundToTouch;

	}

	emitParticles ( _num, _mag ) {

		if ( !this.gameElements.player ) return;
		let player = this.gameElements.player.instances[ 0 ];

		if ( _num > 2 ) {

			this.soundManager.play ( 'Hit_sound_' + Math.floor ( Math.random () * 4 ), { volume: 1.0 } );
			this.soundManager.play ( 'Gong_sound_' + Math.floor ( Math.random () * 4 ), { volume: 0.2 } );
			this.soundManager.play ( 'Explosion_sound_' + Math.floor ( Math.random () * 3 ), { volume: 0.3 } );

		}

		// Add particles

		if ( this.particles.length < this.nParticles ) {

			for ( let i = 0; i < ( _num || 2 ); i ++ ) {

				this.particles.push ( new PhysicalElement ( {

					position: player.position,
					scale: [ Math.random () * 10 * this.renderer.getPixelRatio () + 1.0, 0, 0 ],
					acceleration: [ ( Math.random () - 0.5 ) * ( _mag || 20 ), ( Math.random () - 0.5 ) * ( _mag || 20 ), 0 ],
					velocity: vec3.scale ( vec3.create (), player.velocity, 0.2 ),
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

		if ( !this.gameElements.player ) return;
		let player = this.gameElements.player.instances[ 0 ];

		// Update the particles & the geometry used to render them.

		for ( let i = this.nParticles - 4; i >= 0 ; i -- ) {

			let bufferIndex = i * 3;

			if ( i < this.particles.length ) {

				let force = vec3.sub ( [ 0, 0, 0 ], player.position, this.particles[ i ].position );
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

	updateInfoArrow () {

		if ( !this.infoArrow ) return;

		let player = this.gameElements.player.instances[ 0 ];
		let acceleration = player.accelerationCache;
		// console.log(acceleration);
		let length = vec3.length ( acceleration ) / player.mass;
		let rotation = Math.atan2 ( acceleration[ 1 ], acceleration[ 0 ] );

		length = Math.min ( Math.max ( length, 0.0000001 ), 100 );

		// console.log(length);

		if ( length > 0.005 ) length = 0.0000000001;

		let scaleM = 500.5;

		this.arrowHead.scale.set ( 0.1, 0.1, 0.1 );
		this.arrowHead.position.y = length * scaleM;
		this.arrowLine.scale.y = length * scaleM;
		this.arrowLine.position.y = length * scaleM * 0.5;
		this.infoArrow.position.set ( player.position[ 0 ], player.position[ 1 ], 0 );
		this.infoArrow.rotation.z = rotation - Math.PI * 0.5;

	}

	addLoadingObject () {

		this.loadObjects ++;

	}

	objectOnLoad ( _string ) {

		this.loadObjects --;

		if ( _string ) {

			// console.log ( 'loaded: ' + _string );

		}

		if ( this.loadObjects == 0 ) {

			// console.log('\n*** Level loaded ***\n ');

			this.levelLoaded = true;

			if ( this.onLoadCallback ) {

				for ( let i = 0; i < this.onLoadCallback.length; i ++ ) {

					this.onLoadCallback[ i ]();

				}

			}

		}

	}

	onLoad ( _callback ) {

		if ( !this.onLoadCallback ) this.onLoadCallback = [];
		this.onLoadCallback.push ( _callback );

	}

	update ( _deltaTime, _forceUpdate ) {

		if ( !this.levelLoaded && !_forceUpdate ) return;

		// Update the screens.

		if ( this.scanScreen.position.x >= this.getWorldRight () * 1.8 ) this.scanScreenClosed = true;
		else this.scanScreenClosed = false;

		if ( this.scanScreen.position.x <= 0.5 ) this.scanScreenOpened = true;
		else this.scanScreenOpened = false;

		this.scanScreen.position.x += ( this.scanScreenTargetPosition.x - this.scanScreen.position.x ) * 0.2;
		this.scanScreen.position.y += ( this.scanScreenTargetPosition.y - this.scanScreen.position.y ) * 0.2;
		this.scanScreenButton.position.x = this.scanScreen.position.x - this.getWorldRight ();
		this.scanScreenButton.position.y = this.scanScreen.position.y;

		if ( this.infoScreen.position.x <= this.getWorldLeft () * 1.8 ) this.infoScreenClosed = true;
		else this.infoScreenClosed = false;

		if ( this.infoScreen.position.x >= -0.5 ) this.infoScreenOpened = true;
		else this.infoScreenOpened = false;

		this.infoScreen.position.x += ( this.infoScreenTargetPosition.x - this.infoScreen.position.x ) * 0.2;
		this.infoScreen.position.y += ( this.infoScreenTargetPosition.y - this.infoScreen.position.y ) * 0.2;
		this.infoScreenButton.position.x = this.infoScreen.position.x + this.getWorldRight ();
		this.infoScreenButton.position.y = this.infoScreen.position.y;

		// Check screens limits. 

		if ( !this.touchDown ) {

			if ( this.scanScreenButton.position.x > this.getWorldRight () * 0.7 ) {

				this.scanScreenTargetPosition.x = this.getWorldRight () * 2.0;

			}

			if ( this.scanScreenButton.position.x < this.getWorldLeft () * 0.7 ) {

				this.scanScreenTargetPosition.x = 0.0;

			}

			if ( this.infoScreenButton.position.x < this.getWorldLeft () * 0.7 ) {

				this.infoScreenTargetPosition.x = this.getWorldLeft () * 2.0;

			}

			if ( this.infoScreenButton.position.x > this.getWorldRight () * 0.7 ) {

				this.infoScreenTargetPosition.x = 0.0;

			}

		}

		// Update the game elements.

		for ( let elementName in this.gameElements ) {

			let element = this.gameElements[ elementName ];

			if ( !element.static && !element.manualMode ) {

				if ( element.individual ) {

					let instances = this.gameElements[ elementName ].instances;

					for ( let i = instances.length - 1; i >= 0 ; i -- ) {

						let instance = instances[ i ];

						if ( !instance.isDead () ) {

							instance.update ( _deltaTime );

							for ( let j = 0; j < element.meshes.length; j ++ ) {
								
								element.meshes[ j ].position.set ( instance.position[ 0 ], instance.position[ 1 ], instance.position[ 2 ] );
								element.meshes[ j ].rotation.set ( instance.rotation[ 0 ], instance.rotation[ 1 ], instance.rotation[ 2 ] );
								element.meshes[ j ].scale.set ( instance.scale[ 0 ], instance.scale[ 1 ], instance.scale[ 2 ] );

							}

						} else {

							this.gameElements[ elementName ].instances.splice ( i, 1 );

						}

					}

				} else {

					let maxInstancesNum = this.gameElements[ elementName ].maxInstancesNum;
					let instances = this.gameElements[ elementName ].instances;

					let geometry = element.mainGeometry;

					for ( let i = maxInstancesNum; i >= 0 ; i -- ) {

						if ( i < instances.length ) {
							
							if ( !instances[ i ].isDead() ) {

								instances[ i ].update ( _deltaTime );

								for ( let j = 0; j < 4; j ++ ) {

									geometry.attributes.transform.array[ i * 16 + j * 4 + 0 ] = instances[ i ].position[ 0 ];
									geometry.attributes.transform.array[ i * 16 + j * 4 + 1 ] = instances[ i ].position[ 1 ];

									geometry.attributes.transform.array[ i * 16 + j * 4 + 3 ] = instances[ i ].rotation[ 2 ];

									geometry.attributes.rgbaColor.array[ i * 16 + j * 4 + 0 ] = instances[ i ].color[ 0 ];
									geometry.attributes.rgbaColor.array[ i * 16 + j * 4 + 1 ] = instances[ i ].color[ 1 ];
									geometry.attributes.rgbaColor.array[ i * 16 + j * 4 + 2 ] = instances[ i ].color[ 2 ];

									// Hack pass the sign along with the scale & color alpha

									if ( instances[ i ].name == 'gravityChargeParticle' ) {

										// console.log(instances[ i ].charge);
										let s = Math.sign ( instances[ i ].charge );
										if ( s == 0 ) s = 1;
										geometry.attributes.transform.array[ i * 16 + j * 4 + 2 ] = instances[ i ].scale[ 0 ] * s;

									} else {

										geometry.attributes.transform.array[ i * 16 + j * 4 + 2 ] = instances[ i ].scale[ 0 ];
										geometry.attributes.rgbaColor.array[ i * 16 + j * 4 + 3 ] = instances[ i ].color[ 3 ];

									}

								}

							} else {

								instances.splice ( i, 1 );

							}

						} else {

							for ( let j = 0; j < 4; j ++ ) {

								geometry.attributes.transform.array[ i * 16 + j * 4 + 0 ] = 0;
								geometry.attributes.transform.array[ i * 16 + j * 4 + 1 ] = 0;
								geometry.attributes.transform.array[ i * 16 + j * 4 + 2 ] = 0;
								geometry.attributes.transform.array[ i * 16 + j * 4 + 3 ] = 0;

								geometry.attributes.rgbaColor.array[ i * 16 + j * 4 + 0 ] = 0;
								geometry.attributes.rgbaColor.array[ i * 16 + j * 4 + 1 ] = 0;
								geometry.attributes.rgbaColor.array[ i * 16 + j * 4 + 2 ] = 0;
								geometry.attributes.rgbaColor.array[ i * 16 + j * 4 + 3 ] = 0;

							}

						}

					}

					geometry.attributes.transform.needsUpdate = true;
					geometry.attributes.rgbaColor.needsUpdate = true;

				}

			} else if ( element.static && !element.manualMode ) {

				let instances = this.gameElements[ elementName ].instances;

				for ( let i = 0; i < instances.length; i ++ ) {

					instances[ i ].update ( _deltaTime );

				}

			}

		}

		// Update arrow

		this.updateInfoArrow ();

		// Particles player

		this.emitParticles ();
		if ( this.particles.length > 0 ) this.updateParticles ();

		// Update end circle

		let aPos = this.gameElements.arrival.instances[ 0 ].position;
		let aSca = this.gameElements.arrival.instances[ 0 ].scale;

		aSca[ 0 ] += ( this.arrivalScaleTarget - aSca[ 0 ] ) * 0.05;
		aSca[ 1 ] += ( this.arrivalScaleTarget - aSca[ 1 ] ) * 0.05;

		this.endCircle.position.set ( aPos[ 0 ], aPos[ 1 ], aPos[ 2 ] );
		this.endCircleMaterial.uniforms.alpha.value += ( this.endCircleAlphaTarget - this.endCircleMaterial.uniforms.alpha.value ) * 0.05;
		this.endCircleMaterial.uniforms.scale.value += ( this.endCircleTargetScale - this.endCircleMaterial.uniforms.scale.value ) * 0.05;

		// Check finish

		let dist = vec3.length ( vec3.sub ( [ 0, 0, 0 ], this.gameElements.arrival.instances[ 0 ].position, this.gameElements.player.instances[ 0 ].position ) );

		if ( dist < this.gameElements.arrival.instances[ 0 ].scale[ 0 ] && !this.levelCompleted && this.scanScreenClosed && this.infoScreenClosed ) {

			this.levelCompleted = true;
			this.endCircleTargetScale = this.getWorldRight () > this.getWorldTop () ? this.getWorldRight () * 4 : this.getWorldTop () * 4;
			this.endCircleAlphaTarget = 0.0;
			this.arrivalScaleTarget = 0.0;

			this.soundManager.play ( 'Gong_sound_' + Math.floor ( Math.random () * 2 ), { volume: 0.2 } );
			this.soundManager.play ( 'Gong_sound_' + ( Math.floor ( Math.random () * 2 ) + 2 ), { volume: 0.2 } );
			this.soundManager.play ( 'Triangle_sound_' + Math.floor ( Math.random () * 2 ), { volume: 0.3 } );

		}

		// Update text intro

		if ( this.textBackground ) this.textBackground.material.opacity += ( this.textBackground.material.alphaTarget - this.textBackground.material.opacity ) * 0.1;
		if ( this.textIntro ) this.textIntro.material.uniforms.opacity.value += ( this.textIntro.material.alphaTarget - this.textIntro.material.uniforms.opacity.value ) * 0.1;

		// Update lines

		if ( this.infoScreenClosed ) return;

		this.updateTextPoints (); // This stores in the elements some text positions.
		let linesData = this.getLinesData ();

		this.linesGeometry.index.array = new Uint32Array ( linesData.index );
		this.linesGeometry.index.needsUpdate = true;

		this.linesGeometry.attributes.position.array = new Float32Array ( linesData.position );
		this.linesGeometry.attributes.position.needsUpdate = true;

		this.linesGeometry.attributes.lineNormal.array = new Float32Array ( linesData.lineNormal );
		this.linesGeometry.attributes.lineNormal.needsUpdate = true;

		this.linesGeometry.attributes.lineMiter.array = new Float32Array ( linesData.lineMiter );
		this.linesGeometry.attributes.lineMiter.needsUpdate = true;

		this.linesGeometry.attributes.lineOpacity.array = new Float32Array ( linesData.lineOpacity );
		this.linesGeometry.attributes.lineOpacity.needsUpdate = true;

	}

	explosionSound () {

		this.soundManager.play ( 'Hit_sound_' + Math.floor ( Math.random () * 4 ), { volume: 2.0 } );
		this.soundManager.play ( 'Gong_sound_' + Math.floor ( Math.random () * 4 ), { volume: 0.05 } );
		this.soundManager.play ( 'Explosion_sound_' + Math.floor ( Math.random () * 3 ), { volume: 0.1 } );

	}

	removeTextIntro () {

		setTimeout ( function () {

			this.infoScreenTargetPosition.x = this.getWorldLeft () * 2;

		}.bind ( this ), 1000 );

		setTimeout ( function () {

			this.scanScreenTargetPosition.x = this.getWorldRight () * 2;

		}.bind ( this ), 1800 );

		if ( this.textIntro ) this.textIntro.material.alphaTarget = 0;
		if ( this.textBackground ) this.textBackground.material.alphaTarget = 0;

	}

	reloadLevel () {}

	clearLevel ( _onClear ) {

		setTimeout ( function () {

			this.renderer.clearDepth();
			this.renderer.clear ();

			while ( this.mainScene.children.length > 0 ) { 

				// this.removeObj ( this.mainScene.children[ 0 ], this.mainScene );
			    this.mainScene.remove ( this.mainScene.children[ 0 ] ); 

			}

			while ( this.scanScene.children.length > 0 ) { 

				// this.removeObj ( this.mainScene.children[ 0 ] );
			    this.scanScene.remove ( this.scanScene.children[ 0 ] ); 

			}

			while ( this.infoScene.children.length > 0 ) { 

			    this.infoScene.remove ( this.infoScene.children[ 0 ] ); 

			}

			if ( _onClear ) _onClear ();

			this.backgroundSound.stop ();

		}.bind ( this ), 1000 );

	}

	removeObj ( obj, scene ) {

		if (obj instanceof THREE.Mesh) {
			       
			obj.geometry.dispose();
			obj.geometry = null;
			obj.material.dispose();
			obj.material = null;
			obj.dispose(); // required in r69dev to remove references from the renderer.
			obj = null;

		} else {
			
			if (obj.children !== undefined) {
			    
			    while (obj.children.length > 0) {
			        
			        scene(obj.children[0]);
			        obj.remove(obj.children[0]);
			            
			    }
			}
		}
	}

	onWin ( _callback ) {

		this.onWinCallback = _callback;

	}

	updateRenderer () {

		this.renderer.clearDepth();
		this.renderer.clear ();
		this.renderer.render ( this.mainScene, this.mainCamera );
		this.renderer.render ( this.scanScene, this.mainCamera, this.scanSceneRenderTarget );
		this.renderer.render ( this.infoScene, this.mainCamera, this.infoSceneRenderTarget );
		this.renderer.clearDepth();
		this.renderer.render( this.screensScene, this.mainCamera );

	}

	render () {

		this.renderer.clearDepth();
		this.renderer.clear ();

		if ( !this.scanScreenOpened && !this.infoScreenOpened ) {

			this.renderer.render ( this.mainScene, this.mainCamera );
			
		}

		// Render to scan target

		if ( !this.scanScreenClosed && !this.infoScreenOpened ) {

			this.renderer.render ( this.scanScene, this.mainCamera, this.scanSceneRenderTarget );

		}

		// Render to info target

		if ( !this.infoScreenClosed ) {

			this.renderer.render ( this.infoScene, this.mainCamera, this.infoSceneRenderTarget );
			
		}

		this.renderer.clearDepth();
		this.renderer.render( this.screensScene, this.mainCamera );

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
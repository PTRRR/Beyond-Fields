(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.GravityLevel = undefined;

var _LevelCore2 = require("./LevelCore");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GravityLevel = exports.GravityLevel = function (_LevelCore) {
	_inherits(GravityLevel, _LevelCore);

	function GravityLevel() {
		_classCallCheck(this, GravityLevel);

		return _possibleConstructorReturn(this, (GravityLevel.__proto__ || Object.getPrototypeOf(GravityLevel)).call(this));
	}

	return GravityLevel;
}(_LevelCore2.LevelCore);

},{"./LevelCore":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.GravityElectricLevel = undefined;

var _LevelCore2 = require("./LevelCore");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GravityElectricLevel = exports.GravityElectricLevel = function (_LevelCore) {
	_inherits(GravityElectricLevel, _LevelCore);

	function GravityElectricLevel() {
		_classCallCheck(this, GravityElectricLevel);

		return _possibleConstructorReturn(this, (GravityElectricLevel.__proto__ || Object.getPrototypeOf(GravityElectricLevel)).call(this));
	}

	return GravityElectricLevel;
}(_LevelCore2.LevelCore);

},{"./LevelCore":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.GravityLevel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _LevelCore2 = require("./LevelCore");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GravityLevel = exports.GravityLevel = function (_LevelCore) {
	_inherits(GravityLevel, _LevelCore);

	function GravityLevel(_options) {
		_classCallCheck(this, GravityLevel);

		try {
			var _this = _possibleConstructorReturn(this, (GravityLevel.__proto__ || Object.getPrototypeOf(GravityLevel)).call(this, _options));

			_this.build();
		} catch (e) {

			console.error(e);
		}

		return _this;
	}

	_createClass(GravityLevel, [{
		key: "build",
		value: function build() {

			_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "build", this).call(this);
		}
	}, {
		key: "update",
		value: function update() {

			_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "update", this).call(this);
		}
	}, {
		key: "render",
		value: function render() {

			_get(GravityLevel.prototype.__proto__ || Object.getPrototypeOf(GravityLevel.prototype), "render", this).call(this);
		}
	}]);

	return GravityLevel;
}(_LevelCore2.LevelCore);

},{"./LevelCore":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.LevelCore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('../utils');

var _shaderHelper = require('./shaderHelper');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LevelCore = exports.LevelCore = function () {
		function LevelCore(_options) {
				_classCallCheck(this, LevelCore);

				if (!_options || !_options.levelFile) {

						this.throwError('You must specify a level file to build a level');
						return;
				} else if (!_options || !_options.renderer) {

						this.throwError('You must pass the renderer element to the level');
						return;
				}

				// Core elements

				this.levelFile = _options.levelFile;
				this.renderer = _options.renderer;

				this.mouse = new THREE.Vector2();
				this.mouseWorld = new THREE.Vector3();
				this.raycaster = new THREE.Raycaster();

				// Level elements

				this.mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
				this.mainCamera.position.z = 5;

				this.mainScene = new THREE.Scene();
				this.mainScene.background = new THREE.Color(0xEFEFEF);

				this.scanScene = new THREE.Scene();
				this.scanSceneRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { depthBuffer: false, stencilBuffer: false });
				this.scanScene.background = new THREE.Color(0x000000);

				this.infoScene = new THREE.Scene();
				this.infoSceneRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { depthBuffer: false, stencilBuffer: false });
				this.infoScene.background = new THREE.Color(0x808080);

				// Render all scenes once the get right matrices.

				this.renderer.render(this.mainScene, this.mainCamera);
				this.renderer.render(this.scanScene, this.mainCamera);
				this.renderer.render(this.infoScene, this.mainCamera);

				// Objects

				this.gameElements = {};
		}

		_createClass(LevelCore, [{
				key: 'onMove',
				value: function onMove(_position) {

						this.mouse.x = _position[0];
						this.mouse.y = _position[1];

						this.updateMouseWorld(this.mouse);
				}
		}, {
				key: 'onClick',
				value: function onClick(_position) {

						this.mouse.x = _position[0];
						this.mouse.y = _position[1];

						this.updateMouseWorld(this.mouse);
				}
		}, {
				key: 'build',
				value: function build() {

						// Declare some useful variables

						this.worldTop = this.get3DPointOnBasePlane(new THREE.Vector2(0, 0)).y;
						this.worldBottom = this.get3DPointOnBasePlane(new THREE.Vector2(0, window.innerHeight)).y;
						this.worldLeft = this.get3DPointOnBasePlane(new THREE.Vector2(0, 0)).x;
						this.worldRight = this.get3DPointOnBasePlane(new THREE.Vector2(window.innerWidth, 0)).x;

						// Add base elements.
						// Add the scale square in the background.

						this.addElement('scaleSquare', {

								static: true,
								manualMode: false,

								shaders: {

										main: null,

										normal: {

												name: 'solidQuad',
												// textureUrl: './resources/textures/generic_circle_sdf.png',
												uniforms: {

														solidColor: { value: [0.9, 0.9, 0.9, 1.0] }

												}

										},

										scan: {

												name: 'simpleTexture',
												textureUrl: './resources/textures/generic_circle_sdf.png',
												uniforms: {}

										},

										infos: {

												name: 'simpleTexture',
												textureUrl: './resources/textures/generic_circle_sdf.png',
												uniforms: {}

										}

								},

								instances: {

										0: {

												enabled: true,
												position: vec3.fromValues(0, 0, 0),
												rotation: vec3.fromValues(0.0, 0.0, 0.0),
												scale: vec3.fromValues(2.0, 2.0, 1.0),
												velocity: { x: 0, y: 0, z: 0 }

										}

								}

						});

						// Add the goals elements.

						this.addElement('goals', {

								static: true,
								manualMode: false,

								shaders: {

										main: null,

										normal: {

												name: 'solidQuad',
												uniforms: {

														solidColor: { value: [0.7, 0.7, 0.7, 1.0] }

												}

										},

										scan: null,
										infos: null

								},

								instances: {

										0: {

												enabled: true,
												position: vec3.fromValues(0, this.worldTop, 0),
												rotation: vec3.fromValues(0.0, 0.0, 0.0),
												scale: vec3.fromValues(1.0, 0.2, 0.5),
												velocity: { x: 0, y: 0, z: 0 }

										},

										1: {

												enabled: true,
												position: vec3.fromValues(0, this.worldBottom, 0),
												rotation: vec3.fromValues(0.0, 0.0, 0.0),
												scale: vec3.fromValues(1.0, 0.2, 0.5),
												velocity: { x: 0, y: 0, z: 0 }

										}

								}

						});

						// Add level elements

						for (var elementName in this.levelFile.elements) {

								var element = this.levelFile.elements[elementName];
								var manualMode = element.manualMode;

								if (!manualMode) {

										this.addElement(elementName, element);
								}
						}
				}
		}, {
				key: 'addElement',
				value: function addElement(_name, _element) {

						this.gameElements[_name] = {};

						var textureUrl = _element.texture;
						var shaders = _element.shaders;
						var instances = _element.instances;

						if (_element.static) {

								// Build a geometry composed with quads.

								var vertices = [];
								var colors = [];
								var uvs = [];
								var indices = [];

								for (var instanceIndex in instances) {

										var instance = instances[instanceIndex];

										// Set default variables if missing.

										instance.position = instance.position || vec3.fromValues(0.0, 0.0, 0.0);
										instance.rotation = instance.rotation || vec3.fromValues(0.0, 0.0, 0.0);
										instance.scale = instance.scale || vec3.fromValues(1.0, 1.0, 1.0);
										instance.color = instance.color || vec4.fromValues(1.0, 1.0, 1.0, 1.0);

										// Create a quad with the position, rotation, and scale of the object.

										var quad = this.getQuad(instance.position, instance.rotation, instance.scale);

										// Update the indices

										for (var i = 0; i < quad.indices.length; i++) {

												indices.push(quad.indices[i] + vertices.length / 3);
										}

										// Update vertices

										for (var _i = 0; _i < quad.vertices.length; _i++) {

												vertices.push(quad.vertices[_i]);
										}

										// Update uvs

										for (var _i2 = 0; _i2 < quad.uvs.length; _i2++) {

												uvs.push(quad.uvs[_i2]);
										}

										// Update colors

										for (var _i3 = 0; _i3 < 4; _i3++) {

												colors.push(instance.color[0]);
												colors.push(instance.color[1]);
												colors.push(instance.color[2]);
												colors.push(instance.color[3]);
										}
								}

								var geometry = new THREE.BufferGeometry();
								geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
								geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
								geometry.addAttribute('rgbaColor', new THREE.BufferAttribute(new Float32Array(colors), 4));
								geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));

								this.getElementMaterial(_element, function (materials) {

										if (materials.main) {

												var mainMesh = new THREE.Mesh(geometry, materials.main);
												this.mainScene.add(mainMesh);
												this.scanScene.add(mainMesh);
												this.infoScene.add(mainMesh);
										} else {

												if (materials.normal) {

														var normalMesh = new THREE.Mesh(geometry, materials.normal);
														this.mainScene.add(normalMesh);
												}

												if (materials.scan) {

														var scanMesh = new THREE.Mesh(geometry, materials.scan);
														this.scanScene.add(scanMesh);
												}

												if (materials.info) {

														var infoMesh = new THREE.Mesh(geometry, materials.info);
														this.infoScene.add(infoMesh);
												}
										}
								}.bind(this));
						} else {}
				}
		}, {
				key: 'getQuad',
				value: function getQuad(position, rotation, scale) {

						// Create a qud geometry composed of four vertices uvs and indices.

						var vertices = [];
						var uvs = [0, 0, 1, 0, 1, 1, 0, 1];
						var indices = [0, 1, 2, 2, 3, 0];

						var v = [vec3.fromValues(-1.0, -1.0, 0.0), vec3.fromValues(1.0, -1.0, 0.0), vec3.fromValues(1.0, 1.0, 0.0), vec3.fromValues(-1.0, 1.0, 0.0)];

						var modelMatrix = mat4.create();
						mat4.translate(modelMatrix, modelMatrix, position);
						mat4.scale(modelMatrix, modelMatrix, scale);
						mat4.rotateX(modelMatrix, modelMatrix, rotation[0], [1, 0, 0]);
						mat4.rotateY(modelMatrix, modelMatrix, rotation[1], [0, 1, 0]);
						mat4.rotateZ(modelMatrix, modelMatrix, rotation[2], [0, 0, 1]);

						for (var i = 0; i < 4; i++) {

								vec3.transformMat4(v[i], v[i], modelMatrix);

								vertices.push(v[i][0]);
								vertices.push(v[i][1]);
								vertices.push(v[i][2]);
						}

						return {

								vertices: vertices,
								uvs: uvs,
								indices: indices

						};
				}
		}, {
				key: 'getElementMaterial',
				value: function getElementMaterial(_element, _onLoad) {

						var shaders = _element.shaders;
						var materials = {};
						var numShaders = Object.keys(shaders).length;

						var _loop = function _loop(type) {

								var shader = shaders[type];

								if (shader) {

										if (shader.textureUrl) {

												(function (shader) {

														var texture = new THREE.TextureLoader().load(shader.textureUrl, function (texture) {

																var uniforms = shader.uniforms;
																uniforms.texture = { value: texture };

																materials[type] = new THREE.ShaderMaterial({

																		vertexShader: _shaderHelper.shaderHelper[shader.name].vertex,
																		fragmentShader: _shaderHelper.shaderHelper[shader.name].fragment,
																		uniforms: uniforms

																});

																materials[type].transparent = true;

																numShaders--;
																checkLoad();
														});
												})(shader);
										} else {

												materials[type] = new THREE.ShaderMaterial({

														vertexShader: _shaderHelper.shaderHelper[shader.name].vertex,
														fragmentShader: _shaderHelper.shaderHelper[shader.name].fragment,
														uniforms: shader.uniforms

												});

												materials[type].transparent = true;

												numShaders--;
												checkLoad();
										}
								} else {

										numShaders--;
										materials[type] = null;
										checkLoad();
								}
						};

						for (var type in shaders) {
								_loop(type);
						}

						function checkLoad() {

								if (numShaders == 0) {

										_onLoad(materials);
								}
						}
				}
		}, {
				key: 'updateMouseWorld',
				value: function updateMouseWorld(_mouse) {

						this.mouseWorld = this.get3DPointOnBasePlane(_mouse);
				}
		}, {
				key: 'get3DPointOnBasePlane',
				value: function get3DPointOnBasePlane(_vector) {

						var vector = new THREE.Vector3();
						vector.set(_vector.x / window.innerWidth * 2 - 1, -(_vector.y / window.innerHeight) * 2 + 1, 0.5);
						vector.unproject(this.mainCamera);
						var dir = vector.sub(this.mainCamera.position).normalize();
						var distance = -this.mainCamera.position.z / dir.z;

						return this.mainCamera.position.clone().add(dir.multiplyScalar(distance));
				}
		}, {
				key: 'update',
				value: function update() {}
		}, {
				key: 'render',
				value: function render() {

						this.renderer.render(this.mainScene, this.mainCamera);
				}
		}, {
				key: 'log',
				value: function log(_string) {

						var text = _string + "";
						console.log(this.constructor.name + ": " + text);
				}
		}, {
				key: 'logWarn',
				value: function logWarn(_string) {

						var text = _string + "";
						console.warn(this.constructor.name + " WARN: " + text);
				}
		}, {
				key: 'logError',
				value: function logError(_string) {

						var text = _string + "";
						console.error(this.constructor.name + " ERROR: " + text);
				}
		}, {
				key: 'throwError',
				value: function throwError(_string) {

						var text = _string + "";
						throw this.constructor.name + " ERROR: " + text;
				}
		}]);

		return LevelCore;
}();

},{"../utils":10,"./shaderHelper":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
			value: true
});
var shaderHelper = {

			test: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform sampler2D texture;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tgl_FragColor = texture2D ( texture, f_Uv );\n\n\t\t\t}\n\n\t\t"

			},

			solidQuad: {

						vertex: "\n\t\t\tvoid main () {\n\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tuniform vec4 solidColor;\n\n\t\t\tvoid main () {\n\n\t\t\t\tgl_FragColor = solidColor;\n\n\t\t\t}\n\n\t\t"

			},

			simpleTexture: {

						vertex: "\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvoid main () {\n\n\t\t\t\tgl_FragColor = texture2D ( texture, f_Uv );\n\n\t\t\t}\n\n\t\t"

			},

			player: {

						vertex: "\n\t\t\tvoid main () {\n\n\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvoid main () {\n\n\n\n\t\t\t}\n\n\t\t"

			},

			planet: {

						vertex: "\n\t\t\tattribute vec4 rgbaColor;\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\n\t\t\tvoid main () {\n\n\t\t\t\tf_Color = rgbaColor;\n\t\t\t\tf_Uv = uv;\n\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvarying vec4 f_Color;\n\t\t\tvarying vec2 f_Uv;\n\t\t\tuniform sampler2D texture;\n\n\t\t\tvoid main () {\n\n\t\t\t\tgl_FragColor = texture2D ( texture, f_Uv ) * f_Color;\n\n\t\t\t}\n\n\t\t"

			},

			smoke: {

						vertex: "\n\t\t\tvoid main () {\n\n\n\n\t\t\t}\n\n\t\t",

						fragment: "\n\t\t\tvoid main () {\n\n\t\t\t\t\n\t\t\t\t\n\t\t\t}\n\n\t\t"

			}

};

exports.shaderHelper = shaderHelper;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.GameManager = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _GravityLevel = require("./GameElements/GravityLevel");

var _ElectricLevel = require("./GameElements/ElectricLevel");

var _GravityElectricLevel = require("./GameElements/GravityElectricLevel");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameManager = exports.GameManager = function () {
	function GameManager(_options) {
		_classCallCheck(this, GameManager);

		this.renderer = _options.renderer;

		// General

		this.currentLevel = null;
	}

	_createClass(GameManager, [{
		key: "onMove",
		value: function onMove(_position) {

			if (this.currentLevel) {

				this.currentLevel.onMove(_position);
			}
		}
	}, {
		key: "onClick",
		value: function onClick(_position) {

			if (this.currentLevel) {

				this.currentLevel.onClick(_position);
			}
		}
	}, {
		key: "update",
		value: function update() {

			if (this.currentLevel) {

				this.currentLevel.update();
			}
		}
	}, {
		key: "render",
		value: function render() {

			if (this.currentLevel) {

				this.currentLevel.render();
			}
		}
	}, {
		key: "startLevel",
		value: function startLevel(_levelFile, _onStart) {

			// Create a new level according to the level file passed as an argument.

			switch (_levelFile.chapter) {

				case 'gravity':

					this.currentLevel = new _GravityLevel.GravityLevel({

						renderer: this.renderer,
						levelFile: _levelFile,
						onStart: _onStart || function () {
							console.log('Level Started');
						}

					});

					break;

				case 'electric':

					this.currentLevel = new _ElectricLevel.ElectricLevel({

						renderer: this.renderer,
						levelFile: _levelFile,
						onStart: _onStart || function () {
							console.log('Level Started');
						}

					});

					break;

				case 'gravity-electric':

					this.currentLevel = new _GravityElectricLevel.GravityElectricLevel({

						renderer: this.renderer,
						levelFile: _levelFile,
						onStart: _onStart || function () {
							console.log('Level Started');
						}

					});

					break;

			}
		}
	}, {
		key: "pauseCurrentLevel",
		value: function pauseCurrentLevel() {}
	}, {
		key: "endCurrentLevel",
		value: function endCurrentLevel() {

			this.currentLevel = null;
		}
	}]);

	return GameManager;
}();

},{"./GameElements/ElectricLevel":1,"./GameElements/GravityElectricLevel":2,"./GameElements/GravityLevel":3}],7:[function(require,module,exports){
"use strict";

var _resourcesList = require("./resourcesList");

var _GameManager = require("./GameManager");

var _utils = require("./utils");

var _levels = require("./levels");

(function () {

		function loadAllResources(_resources, _onLoad) {

				var loadedResources = {};

				if (_resources instanceof Object) {
						(function () {

								var numResources = 0;

								for (var resource in _resources) {

										var type = _resources[resource].type;
										var url = _resources[resource].url;

										loadedResources[resource] = {};
										loadedResources[resource].type = type;
										loadedResources[resource].url = url;

										(function () {
												switch (type) {

														case 'img':

																var image = new Image();
																image.src = url;

																(function (name) {

																		(0, _utils.addEvent)(image, 'load', function () {

																				loadedResources[name].element = this;

																				numResources--;

																				if (numResources == 0) {

																						_onLoad(loadedResources);
																				}
																		});
																})(resource);

																break;

												}
										})();

										numResources++;
								}
						})();
				} else {

						console.error('APP ERROR: resources attribute must be an object!');
				}
		}

		loadAllResources(_resourcesList.resourcesList, function (_loadedResources) {

				init(_loadedResources);
		});

		function init(_loadedResources) {

				// General

				var renderer = new THREE.WebGLRenderer();
				renderer.setSize(window.innerWidth, window.innerHeight);

				var rendererElement = renderer.domElement;
				rendererElement.className = 'main-canvas';
				document.body.appendChild(rendererElement);

				var stats = new Stats();
				stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
				document.body.appendChild(stats.dom);

				// Events

				(0, _utils.addEvent)(rendererElement, 'click', function (event) {

						gameManager.onClick(vec2.fromValues(event.clientX, event.clientY));
				});

				(0, _utils.addEvent)(rendererElement, 'mousemove', function (event) {

						gameManager.onMove(vec2.fromValues(event.clientX, event.clientY));
				});

				// Game

				var gameManager = new _GameManager.GameManager({ renderer: renderer });
				gameManager.startLevel(_levels.levels.gravity[0]);

				function update() {}

				function render() {

						gameManager.render();
				}

				function mainLoop() {

						stats.begin();

						update();
						render();

						stats.end();

						requestAnimationFrame(mainLoop);
				}

				requestAnimationFrame(mainLoop);
		}
})();

},{"./GameManager":6,"./levels":8,"./resourcesList":9,"./utils":10}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
var levels = {

		gravity: {

				0: {

						chapter: 'gravity',

						elements: {

								player: {

										static: false,
										manualMode: false,

										shaders: {

												main: null,

												normal: {

														name: 'player',
														textureUrl: './resources/textures/generic_player_sdf.png',
														uniforms: {}

												},

												scan: {

														name: 'player',
														textureUrl: './resources/textures/generic_player_sdf.png',
														uniforms: {}

												},

												infos: {

														name: 'player',
														textureUrl: './resources/textures/generic_player_sdf.png',
														uniforms: {}

												}

										},

										instances: {

												0: {

														enabled: true,
														position: vec3.fromValues(0, 0, 0),
														rotation: vec3.fromValues(0.0, 0.0, 0.0),
														scale: vec3.fromValues(1.0, 1.0, 1.0),
														velocity: { x: 0, y: 0, z: 0 }

												}

										}

								},

								planets: {

										static: true,
										manualMode: false,

										shaders: {

												main: null,

												normal: {

														name: 'planet',
														textureUrl: './resources/textures/generic_circle_sdf.png',
														uniforms: {}

												},

												scan: {

														name: 'planet',
														textureUrl: './resources/textures/generic_circle_sdf.png',
														uniforms: {}

												},

												infos: {

														name: 'planet',
														textureUrl: './resources/textures/generic_circle_sdf.png',
														uniforms: {}

												}

										},

										instances: {

												0: {

														enabled: true,
														position: vec3.fromValues(-1.5, 0, 0),
														rotation: vec3.fromValues(0.0, 0.0, 0.0),
														scale: vec3.fromValues(1.0, 2.0, 1.0),
														velocity: { x: 0, y: 0, z: 0 },
														color: vec4.fromValues(1.0, 0.0, 0.0, 1.0)

												},

												1: {

														enabled: true,
														position: vec3.fromValues(1.0, 0, 0),
														rotation: vec3.fromValues(0.0, 0.0, 0.3),
														scale: vec3.fromValues(1.0, 1.0, 1.0),
														velocity: { x: 0, y: 0, z: 0 },
														color: vec4.fromValues(1.0, 0.0, 0.0, 1.0)

												}

										}

								},

								smoke: {

										static: false,
										manualMode: true,

										shaders: {

												main: null,

												normal: {

														name: 'smoke',
														textureUrl: './resources/textures/smoke.png',
														uniforms: {}

												},

												scan: null,
												infos: null

										},

										instances: {}

								}

						}

				},

				1: {},

				2: {},

				3: {},

				4: {}

		},

		electric: {

				0: {},

				1: {},

				2: {},

				3: {},

				4: {}

		},

		gravityElectric: {

				0: {},

				1: {},

				2: {},

				3: {},

				4: {}

		}

};

exports.levels = levels;

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var resourcesList = {

	generic_circle: {

		type: 'img',
		url: './resources/textures/generic_circle_sdf.png'

	},

	generic_obstacle: {

		type: 'img',
		url: './resources/textures/generic_obstacle_sdf.png'

	},

	generic_player: {

		type: 'img',
		url: './resources/textures/generic_player_sdf.png'

	},

	smoke: {

		type: 'img',
		url: './resources/textures/smoke.png'

	},

	smoke_2: {

		type: 'img',
		url: './resources/textures/smoke_2.png'

	}

};

exports.resourcesList = resourcesList;

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addEvent = addEvent;
exports.removeEvent = removeEvent;
exports.ajax = ajax;
exports.guid = guid;
exports.hslToRgb = hslToRgb;
exports.getColorFromVertices = getColorFromVertices;
exports.getColorsFromVertices = getColorsFromVertices;
exports.clamp = clamp;
exports.contains = contains;
exports.Float32Concat = Float32Concat;
function addEvent(elem, event, fn) {

    // avoid memory overhead of new anonymous functions for every event handler that's installed
    // by using local functions

    function listenHandler(e) {

        var ret = fn.apply(this, arguments);

        if (ret === false) {

            e.stopPropagation();
            e.preventDefault();
        }

        return ret;
    }

    function attachHandler() {

        // set the this pointer same as addEventListener when fn is called
        // and make sure the event is passed to the fn also so that works the same too

        var ret = fn.call(elem, window.event);

        if (ret === false) {

            window.event.returnValue = false;
            window.event.cancelBubble = true;
        }

        return ret;
    }

    if (elem.addEventListener) {

        elem.addEventListener(event, listenHandler, true);
        return { elem: elem, handler: listenHandler, event: event };
    } else {

        elem.attachEvent("on" + event, attachHandler);
        return { elem: elem, handler: attachHandler, event: event };
    }
}

function removeEvent(token) {

    if (token.elem.removeEventListener) {

        token.elem.removeEventListener(token.event, token.handler);
    } else {

        token.elem.detachEvent("on" + token.event, token.handler);
    }
}

function ajax(_url, _callback) {

    var request = new XMLHttpRequest();
    request.open('GET', _url, true);
    request.onload = function () {

        if (request.status < 200 || request.status > 299) {

            _callback('Error: Http status' + request.status + ' on resource ' + _url);
        } else {

            _callback(null, request);
        }
    };

    request.send();
}

function guid() {

    function s4() {

        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function hslToRgb(h, s, l) {

    var r, g, b;

    if (s == 0) {

        r = g = b = l; // achromatic
    } else {

        var hue2rgb = function hue2rgb(p, q, t) {

            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
}

function getColorFromVertices(_vertices, _color) {

    var colors = [];

    for (var i = 0; i < _vertices.length; i += 3) {

        colors.push(_color[0]);
        colors.push(_color[1]);
        colors.push(_color[2]);
        colors.push(_color[3]);
    }

    return colors;
}

function getColorsFromVertices(_vertices, _colors) {

    var colors = [];

    for (var i = 0; i < _vertices.length; i += 3) {

        var randomIndexColor = Math.floor(Math.random() * _colors.length);

        var l = (Math.random() - 0.5) * 0.1;

        colors.push(_colors[randomIndexColor][0] + l);
        colors.push(_colors[randomIndexColor][1] + l);
        colors.push(_colors[randomIndexColor][2] + l);
        colors.push(_colors[randomIndexColor][3]);
    }

    return colors;
}

function clamp(val, min, max) {

    return Math.min(Math.max(val, min), max);
};

function contains(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function indexOf(needle) {
            var i = -1,
                index = -1;

            for (i = 0; i < this.length; i++) {
                var item = this[i];

                if (findNaN && item !== item || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

function Float32Concat(first, second) {

    var firstLength = first.length,
        result = new Float32Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;
}

},{}]},{},[7]);

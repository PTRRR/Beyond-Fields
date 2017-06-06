let levels = {

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
							uniforms: {},

						},

						scan: {

							name: 'player',
							textureUrl: './resources/textures/generic_player_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'player',
							textureUrl: './resources/textures/generic_player_sdf.png',
							uniforms: {},

						},

					},

					instances: {

						0: {

							enabled: true,
							position: vec3.fromValues ( 0, 0, 0 ),
							rotation: vec3.fromValues ( 0.0, 0.0, 0.0 ),
							scale: vec3.fromValues ( 1.0, 1.0, 1.0 ),
							velocity: { x: 0, y: 0, z: 0 },

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
							uniforms: {},

						},

						scan: {

							name: 'planet',
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'planet',
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

						0: {

							enabled: true,
							position: vec3.fromValues ( -1.5, 0, 0 ),
							rotation: vec3.fromValues ( 0.0, 0.0, 0.0 ),
							scale: vec3.fromValues ( 1.0, 2.0, 1.0 ),
							velocity: { x: 0, y: 0, z: 0 },
							color: vec4.fromValues ( 1.0, 0.0, 0.0, 1.0 ),

						},

						1: {

							enabled: true,
							position: vec3.fromValues ( 1.0, 0, 0 ),
							rotation: vec3.fromValues ( 0.0, 0.0, 0.3 ),
							scale: vec3.fromValues ( 1.0, 1.0, 1.0 ),
							velocity: { x: 0, y: 0, z: 0 },
							color: vec4.fromValues ( 1.0, 0.0, 0.0, 1.0 ),

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
							uniforms: {},

						},

						scan: null,
						infos: null,

					},

					instances: {}

				}

			}

		},

		1: {


		},

		2: {


		},

		3: {


		},

		4: {


		},

	},

	electric: {

		0: {

		},

		1: {


		},

		2: {


		},

		3: {


		},

		4: {


		},

	},

	gravityElectric: {

		0: {

		},

		1: {


		},

		2: {


		},

		3: {


		},

		4: {


		},

	}

}

export { levels };
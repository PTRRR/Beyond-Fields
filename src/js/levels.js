let levels = {

	gravity: {

		0: {

			chapter: 'gravity',

			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,

					shaders: {

						main: null,

						normal: {

							name: 'planet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'scanPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'infoPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

						0: {

							enabled: true,
                            position: [ -2, 0, 0 ],
                            radius: 4,
                            mass: 1000000,
                            scale: [ 1.8, 1.8, 1.8 ],
                            color: [ 255/255, 222/255, 40/255, 1 ],

                        },

					}

				},

				blackMatter: {

					elementType: 'BlackMatter',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 400,

					shaders: {

						main: null,

						normal: {

							name: 'blackMatter',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'blackMatterScan',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'blackMatter',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {}

				}

			}

		},

		1: {

			chapter: 'gravity',

			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,

					shaders: {

						main: null,

						normal: {

							name: 'planet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'scanPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'infoPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

						1: {

                            position: [ 1.8, 0, 0 ],
                            radius: 2,
                            mass: 10000,
                            scale: [ 0.6, 0.6, 0.6 ],
                            color: [ 245/255, 30/255, 30/255, 1 ],

                        },

                        2: {

                            position: [ -1.5, 1.5, 0 ],
                            radius: 2,
                            mass: 1000000,
                            scale: [ 1.0, 1.0, 1.0 ],
                            color: [ 180/255, 180/255, 180/255, 1 ],

                        },

                        3: {

                            position: [ -1.8, -1.8, 0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 0.4, 0.4, 0.4 ],
                            color: [ 245/255, 30/255, 30/255, 1 ],

                        },

					}

				},

				blackMatter: {

					elementType: 'BlackMatter',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 400,

					shaders: {

						main: null,

						normal: {

							name: 'blackMatter',
							// blending: 'MultiplyBlending',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'blackMatter',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'blackMatter',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {}

				}

			}

		},

		2: {

			chapter: 'gravity',

			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,

					shaders: {

						main: null,

						normal: {

							name: 'planet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'scanPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'infoPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

						0: {

                            position: [ 0, 0, 0 ],
                            radius: 2,
                            mass: 10000,
                            scale: [ 0.6, 0.6, 0.6 ],
                            color: [ 255/255, 222/255, 40/255, 1 ],

                        },

                        1: {

                            position: [ 1.8, -1.8, 0 ],
                            radius: 2,
                            mass: 500000,
                            scale: [ 1.0, 1.0, 1.0 ],
                            color: [ 229/255, 36/255, 31/255, 1 ],

                        },

                        2: {

                            position: [ -1.8, 1.8, 0 ],
                            radius: 2,
                            mass: 500000,
                            scale: [ 1.0, 1.0, 1.0 ],
                            color: [ 229/255, 36/255, 31/255, 1 ],

                        },

					}

				},

				blackMatter: {

					elementType: 'BlackMatter',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 400,

					shaders: {

						main: null,

						normal: {

							name: 'blackMatter',
							// blending: 'MultiplyBlending',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'blackMatter',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'blackMatter',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {}

				}


			}

		},

		3: {

			chapter: 'gravity',

			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,

					shaders: {

						main: null,

						normal: {

							name: 'planet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'scanPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'infoPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

						0: {

                            position: [ -2.0, 0, 0 ],
                            radius: 2,
                            mass: 600000,
                            scale: [ 2.5, 2.5, 2.5 ],
                            color: [ 229/255, 36/255, 31/255, 1 ],

                        },

                        1: {

                            position: [ 0.5, 0, 0 ],
                            radius: 2,
                            mass: 50000,
                            scale: [ 0.6, 0.6, 0.6 ],
                            color: [ 255/255, 222/255, 40/255, 1 ],

                        },

					}

				},

				blackMatter: {

					elementType: 'BlackMatter',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 400,

					shaders: {

						main: null,

						normal: {

							name: 'blackMatter',
							// blending: 'MultiplyBlending',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'blackMatter',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'blackMatter',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {}

				}

			}

		},

		4: {

			chapter: 'gravity',

			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,

					shaders: {

						main: null,

						normal: {

							name: 'planet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'scanPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'infoPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

						0: {

                            position: [ 0, -1.0, 0 ],
                            radius: 2,
                            mass: 400000,
                            scale: [ 0.9, 0.9, 0.9 ],
                            color: [ 150/255, 150/255, 150/255, 1 ],

                        },

                        // 1: {

                        //     position: [ 1.5, 1.5, 0 ],
                        //     radius: 2,
                        //     mass: 100000,
                        //     scale: [ 0.6, 0.6, 0.6 ],
                        //     color: [ 255/255, 222/255, 40/255, 1 ],

                        // },

                        // 2: {

                        //     position: [ -1.5, 1.5, 0 ],
                        //     radius: 2,
                        //     mass: 100000,
                        //     scale: [ 0.6, 0.6, 0.6 ],
                        //     color: [ 255/255, 222/255, 40/255, 1 ],

                        // },

					}

				},

				blackMatter: {

					elementType: 'BlackMatter',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 400,

					shaders: {

						main: null,

						normal: {

							name: 'blackMatter',
							// blending: 'MultiplyBlending',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'blackMatter',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'blackMatter',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {}

				}

			}

		},

	},

	electric: {

		0: {

			chapter: 'electric',

			elements: {

				fixedCharges: {

					elementType: 'ElectricParticle',
					static: true,
					manualMode: false,
					transparent: true,

					shaders: {

						main: null,

						normal: {

							name: 'planet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'scanPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'infoPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

                        // 1: {

                        //     position: [ 0, -1.0, 0.0 ],
                        //     radius: 2,
                        //     charge: 0,
                        //     scale: [ 0.8, 0.8, 0.1 ],
                        //     rotation: [ 0, 0, Math.PI * -0.25],
                        //     color: [ 0.9, 0.1, 0.1, 1 ],

                        // },

					}

				},

				charges: {

					elementType: 'ElectricParticle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 20,

					shaders: {

						main: null,

						normal: {

							name: 'electricCharge',
							transparent: true,
							blending: 'MultiplyBlending',
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'scanPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'infoPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {}

				},

				obstacles: {

					elementType: 'Obstacle',
					static: true,
					manualMode: false,
					transparent: true,

					shaders: {

						main: null,

						normal: {

							name: 'planet',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'scanPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'infoPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

                        1: {

                            position: [ 0.63, 0, 0.0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 1.0, 0.12, 0.1 ],
                            rotation: [ 0, 0, Math.PI * -0.25],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

                        2: {

                            position: [ -0.63, 0, 0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 1.0, 0.12, 0.6 ],
                            rotation: [ 0, 0, Math.PI * 0.25],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

					}

				},

			}

		},

		// 1: {


		// },

		// 2: {


		// },

		// 3: {


		// },

		// 4: {


		// },

	},

	gravityElectric: {

		0: {

			chapter: 'gravity-electric',

			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,
					enableUpdate: true,

					shaders: {

						main: null,

						normal: {

							name: 'electricPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'scanPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'infoPlanet',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

						0: {

                            position: [ -2, 0, 0 ],
                            radius: 4,
                            mass: 1000000,
                            scale: [ 1.8, 1.8, 1.8 ],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

                        1: {

                            position: [ 2, 0, 0 ],
                            radius: 3.5,
                            mass: 100000,
                            scale: [ 1.5, 1.5, 1.5 ],
                            color: [ 0.8, 0.8, 0.8, 1 ],

                        },

					}

				},

				charges: {

					elementType: 'ElectricPlanetParticle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 200,

					shaders: {

						main: null,

						normal: {

							name: 'electricCharge',
							blending: 'MultiplyBlending',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'electricChargeScan',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'electricChargeInfo',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {}

				}

			}


		},

		// 1: {


		// },

		// 2: {


		// },

		// 3: {


		// },

		// 4: {


		// },

	}

}

export { levels };
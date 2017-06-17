let levels = {

	gravity: {

		0: {

			chapter: 'gravity',
			textIntro: 'G\n\n----------\n\nTry to change the vehicle\'s trajectory by placing objects along it\'s road.\n\nJust drag on the screen to counterbalance the attractive forces emitted by the big circles.\n\nClick to start',
			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					maxInstancesNum: 3,
					textAlign: 'bottom',

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
							blanding: 'NormalBlending',
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

							infoPointIndex: 16 * 7 + 3,
							enabled: true,
                            position: [ -2, 0, 0 ],
                            radius: 4,
                            mass: 500000,
                            scale: [ 1.8, 1.8, 1.8 ],
                            color: [ 255/255, 222/255, 40/255, 1 ],
                            rotation: [ 0, 0, 0 ],

                        },

					}

				},

				blackMatter: {

					elementType: 'BlackMatter',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 108,
					renderOrder: 3,
					drawInfos: true,
					mainInfoPointIndex: 3, // 0 - 8

					shaders: {

						main: null,

						normal: {

							name: 'blackMatter',
							blending: 'MultiplyBlending',
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

							name: 'blackMatterInfo',
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
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					maxInstancesNum: 3,

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

							infoPointIndex: 16 * 7 + 5,
                            position: [ 1.8, 0, 0 ],
                            radius: 2,
                            mass: 10000,
                            scale: [ 0.6, 0.6, 0.6 ],
                            color: [ 245/255, 30/255, 30/255, 1 ],

                        },

                        2: {

                        	infoPointIndex: 16 * 7 + 3,
                            position: [ -1.5, 1.5, 0 ],
                            radius: 2,
                            mass: 1000000,
                            scale: [ 1.0, 1.0, 1.0 ],
                            color: [ 180/255, 180/255, 180/255, 1 ],

                        },

                        3: {

                        	infoPointIndex: 16 * 7 + 1,
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
					maxInstancesNum: 108,
					renderOrder: 3,
					drawInfos: true,
					mainInfoPointIndex: 3, // 0 - 8

					shaders: {

						main: null,

						normal: {

							name: 'blackMatter',
							blending: 'MultiplyBlending',
							// blending: 'MultiplyBlending',
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

							name: 'blackMatterInfo',
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
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					maxInstancesNum: 3,

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

							infoPointIndex: 16 * 7 + 3,
                            position: [ 0, 0, 0 ],
                            radius: 2,
                            mass: 10000,
                            scale: [ 0.6, 0.6, 0.6 ],
                            color: [ 255/255, 222/255, 40/255, 1 ],

                        },

                        1: {

                        	infoPointIndex: 16 * 7 + 5,
                            position: [ 1.8, -1.8, 0 ],
                            radius: 2,
                            mass: 500000,
                            scale: [ 1.0, 1.0, 1.0 ],
                            color: [ 229/255, 36/255, 31/255, 1 ],

                        },

                        2: {

                        	infoPointIndex: 16 * 7 + 1,
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
					maxInstancesNum: 108,
					renderOrder: 3,
					drawInfos: true,
					mainInfoPointIndex: 3, // 0 - 8

					shaders: {

						main: null,

						normal: {

							name: 'blackMatter',
							blending: 'MultiplyBlending',
							// blending: 'MultiplyBlending',
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

							name: 'blackMatterInfo',
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
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					maxInstancesNum: 3,

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

							infoPointIndex: 16 * 7 + 1,
                            position: [ -2.0, 0, 0 ],
                            radius: 2,
                            mass: 600000,
                            scale: [ 2.5, 2.5, 2.5 ],
                            color: [ 229/255, 36/255, 31/255, 1 ],

                        },

                        1: {

                        	infoPointIndex: 16 * 7 + 5,
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
					maxInstancesNum: 108,
					renderOrder: 3,
					drawInfos: true,
					mainInfoPointIndex: 3, // 0 - 8

					shaders: {

						main: null,

						normal: {

							name: 'blackMatter',
							blending: 'MultiplyBlending',
							// blending: 'MultiplyBlending',
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

							name: 'blackMatterInfo',
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
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					maxInstancesNum: 3,

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

							infoPointIndex: 16 * 7 + 3,
                            position: [ 0, -1.0, 0 ],
                            radius: 2,
                            mass: 400000,
                            scale: [ 0.9, 0.9, 0.9 ],
                            color: [ 150/255, 150/255, 150/255, 1 ],

                        },

                        1: {

                        	infoPointIndex: 16 * 7 + 5,
                            position: [ 1.5, 1.5, 0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 0.6, 0.6, 0.6 ],
                            color: [ 255/255, 222/255, 40/255, 1 ],

                        },

                        2: {

                        	infoPointIndex: 16 * 7 + 1,
                            position: [ -1.5, 1.5, 0 ],
                            radius: 2,
                            mass: 100000,
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
					maxInstancesNum: 108,
					renderOrder: 3,
					drawInfos: true,
					mainInfoPointIndex: 3, // 0 - 8

					shaders: {

						main: null,

						normal: {

							name: 'blackMatter',
							blending: 'MultiplyBlending',
							// blending: 'MultiplyBlending',
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

							name: 'blackMatterInfo',
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
			textIntro: 'E = q / r^2\n\n----------\n\nAvoid obstacle by attracting or repulsing the vehicle.\n\nClick and drag up or down to change the vehicle\'s trajectory.\n\nClick to start',

			elements: {

				fixedCharges: {

					elementType: 'ElectricParticle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 20,
					renderOrder: 2,
					drawInfos: true,
					maxInstancesNum: 3,
					textAlign: 'bottom',

					shaders: {

						main: null,

						normal: {

							name: 'fixedElectricCharge',
							blending: 'MultiplyBlending',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'fixedElectricChargeScan',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'fixedElectricChargeInfo',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

						0: {

							infoPointIndex: 16 * 7 + 2,
							enabled: false,
							fixedRadius: true,
                            position: [ -2, 0, 0 ],
                            radius: 0,
                            targetRadius: 0.5,
                            sign: -1,
                            mass: 500000,
                            rotation: [ 0, 0, Math.random () * Math.PI * 2 ],

                        },

                        1: {

							infoPointIndex: 16 * 7 + 4,
							enabled: false,
							fixedRadius: true,
                            position: [ 2, 0, 0 ],
                            radius: 0,
                            targetRadius: 0.5,
                            sign: 1,
                            mass: 500000,
                            rotation: [ 0, 0, Math.random () * Math.PI * 2 ],

                        },

					}

				},

				charges: {

					elementType: 'ElectricParticle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 20,
					renderOrder: 3,
					drawInfos: true,
					mainInfoPointIndex: 3, // 0 - 8

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

				},

				obstacles: {

					elementType: 'Obstacle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 2,
					buildFromInstances: true,
					renderOrder: 2,

					shaders: {

						main: null,

						normal: {

							name: 'obstacle',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'obstacleScan',
							transparent: true,
							uniforms: {},

						},

						infos: {

							name: 'obstacleInfo',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

					},


					instances: {}

				},

			}

		},

		1: {

			chapter: 'electric',
			textIntro: 'E = q / r^2\n\n----------\n\nAvoid obstacle by attracting or repulsing the vehicle.\n\nClick and drag up or down to change the vehicle\'s trajectory.\n\nClick to start',

			elements: {

				fixedCharges: {

					elementType: 'ElectricParticle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 1,
					renderOrder: 2,
					drawInfos: true,
					maxInstancesNum: 3,
					textAlign: 'bottom',

					shaders: {

						main: null,

						normal: {

							name: 'fixedElectricCharge',
							blending: 'MultiplyBlending',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'fixedElectricChargeScan',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'fixedElectricChargeInfo',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

						0: {

							infoPointIndex: 16 * 7 + 3,
							enabled: false,
                            position: [ 0, 0, 0 ],
                            radius: 0,
                            targetRadius: 0.6,
                            sign: 1,
                            mass: 500000,
                            rotation: [ 0, 0, Math.random () * Math.PI * 2 ],

                        },

					}

				},

				charges: {

					elementType: 'ElectricParticle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 20,
					renderOrder: 3,
					drawInfos: true,
					mainInfoPointIndex: 3, // 0 - 8

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

				},

				obstacles: {

					elementType: 'Obstacle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 2,
					buildFromInstances: true,
					renderOrder: 2,

					shaders: {

						main: null,

						normal: {

							name: 'obstacle',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

						scan: null,

						infos: null,

					},


					instances: {}

				},

			}

		},

		2: {

			chapter: 'electric',
			textIntro: 'E = q / r^2\n\n----------\n\nAvoid obstacle by attracting or repulsing the vehicle.\n\nClick and drag up or down to change the vehicle\'s trajectory.\n\nClick to start',

			elements: {

				fixedCharges: {

					elementType: 'ElectricParticle',
					static: true,
					manualMode: false,
					transparent: true,
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					maxInstancesNum: 1,
					textAlign: 'bottom',

					shaders: {

						main: null,

						normal: {

							name: 'fixedElectricCharge',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: null,

						infos: null,

					},


					instances: {

						1: {

							infoPointIndex: 19 * 7 + 3,
							hack: true,
                            position: [ -100, -100, 0.0 ],
                            radius: 2,
                            mass: 0,
                            scale: [ 1.0, 0.12, 0.1 ],
                            rotation: [ 0, 0, Math.PI * -0.25],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

					}

				},

				charges: {

					elementType: 'ElectricParticle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 20,
					renderOrder: 3,
					drawInfos: true,
					mainInfoPointIndex: 3, // 0 - 8

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

				},

				obstacles: {

					elementType: 'Obstacle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 2,
					buildFromInstances: true,
					renderOrder: 2,

					shaders: {

						main: null,

						normal: {

							name: 'obstacle',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'obstacleScan',
							transparent: true,
							uniforms: {},

						},

						infos: {

							name: 'obstacleInfo',
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
                            scale: [ 1.012, 0.12, 0.1 ],
                            rotation: [ 0, 0, Math.PI * -0.25],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

                        2: {

                            position: [ -0.63, 0, 0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 1.012, 0.12, 0.6 ],
                            rotation: [ 0, 0, Math.PI * 0.25],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

					}

				},

			}

		},

		3: {

			chapter: 'electric',
			textIntro: 'E = q / r^2\n\n----------\n\nAvoid obstacle by attracting or repulsing the vehicle.\n\nClick and drag up or down to change the vehicle\'s trajectory.\n\nClick to start',

			elements: {

				fixedCharges: {

					elementType: 'ElectricParticle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 1,
					renderOrder: 2,
					drawInfos: true,
					maxInstancesNum: 3,
					textAlign: 'bottom',

					shaders: {

						main: null,

						normal: {

							name: 'fixedElectricCharge',
							blending: 'MultiplyBlending',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'fixedElectricChargeScan',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'fixedElectricChargeInfo',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},
					},


					instances: {

						0: {

							infoPointIndex: 16 * 7 + 3,
							enabled: false,
                            position: [ 0, 0, 0 ],
                            radius: 0,
                            targetRadius: 0.6,
                            sign: -1,
                            mass: 500000,
                            rotation: [ 0, 0, Math.random () * Math.PI * 2 ],

                        },

					}

				},

				charges: {

					elementType: 'ElectricParticle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 20,
					renderOrder: 3,
					drawInfos: true,
					mainInfoPointIndex: 3, // 0 - 8

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

				},

				obstacles: {

					elementType: 'Obstacle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 4,
					buildFromInstances: true,
					renderOrder: 2,

					shaders: {

						main: null,

						normal: {

							name: 'obstacle',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'obstacleScan',
							transparent: true,
							uniforms: {},

						},

						infos: {

							name: 'obstacleInfo',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

                        1: {

                            position: [ 0, -1, 0.0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 1.0, 0.12, 0.1 ],
                            rotation: [ 0, 0, 0],
                            color: [ 0.9, 0.9, 0.9, 1 ],

                        },

                        2: {

                            position: [ 0, 1, 0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 0.5, 0.12, 0.6 ],
                            rotation: [ 0, 0, 0],
                            color: [ 0.9, 0.9, 0.9, 1 ],

                        },

					}

				},

			}

		},

		4: {

			chapter: 'electric',
			textIntro: 'E = q / r^2\n\n----------\n\nAvoid obstacle by attracting or repulsing the vehicle.\n\nClick and drag up or down to change the vehicle\'s trajectory.\n\nClick to start',

			elements: {

				charges: {

					elementType: 'ElectricParticle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 20,
					renderOrder: 3,
					drawInfos: true,
					mainInfoPointIndex: 3, // 0 - 8

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

				},

				fixedCharges: {

					elementType: 'ElectricParticle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 1,
					renderOrder: 2,
					drawInfos: true,
					maxInstancesNum: 1,
					textAlign: 'bottom',

					shaders: {

						main: null,

						normal: {

							name: 'fixedElectricCharge',
							blending: 'MultiplyBlending',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						scan: null,

						infos: null,
					},

					instances: {

						0: {

							hack: true,
							infoPointIndex: 19 * 7 + 3,
							enabled: true,
                            position: [ -100, -100, 0 ],
                            radius: 0,
                            targetRadius: 0.6,
                            sign: -1,
                            mass: 0,
                            rotation: [ 0, 0, Math.random () * Math.PI * 2 ],

                        },

					}

				},

				obstacles: {

					elementType: 'Obstacle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 4,
					buildFromInstances: true,
					renderOrder: 2,

					shaders: {

						main: null,

						normal: {

							name: 'obstacle',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'obstacleScan',
							transparent: true,
							uniforms: {},

						},

						infos: {

							name: 'obstacleInfo',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

                       1: {

                            position: [ 2, -2, 0.0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 2.0, 0.12, 0.1 ],
                            rotation: [ 0, 0, 0],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

                        2: {

                            position: [ 2, 2, 0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 2.0, 0.12, 0.6 ],
                            rotation: [ 0, 0, 0],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

                        3: {

                            position: [ -2, -2, 0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 2.5, 0.12, 0.6 ],
                            rotation: [ 0, 0, Math.PI * 0.25],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

                        4: {

                            position: [ -2, 2, 0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 2.5, 0.12, 0.6 ],
                            rotation: [ 0, 0, Math.PI * -0.25],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

					}

				},

			}

		},

	},

	gravityElectric: {

		0: {

			chapter: 'gravity-electric',
			textIntro: 'G || E\n\n----------\n\nChange the sign of the particles contained in the big circles to counterbalace their attractive force.\n\nClick and drag up or down.\n\nClick to start',

			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					maxInstancesNum: 3,
					textAlign: 'bottom',


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

							name: 'electricPlanet',
							infoPointIndex: 16 * 7 + 2,
							particles: [ 1, 3, 6, 12 ],
                            position: [ -2, 0, 0 ],
                            radius: 4,
                            mass: 10000,
                            scale: [ 1.3, 1.3, 1.3 ],
                            color: [ 0.8, 0.8, 0.8, 1 ],
                            charge: 25,

                        },

                        1: {

                        	name: 'electricPlanet',
                        	infoPointIndex: 16 * 7 + 4,
                        	particles: [ 1, 3, 6, 12 ],
                            position: [ 2, 0, 0 ],
                            radius: 3.5,
                            mass: 10000,
                            scale: [ 1.3, 1.3, 1.3 ],
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
					renderOrder: 3,

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

							name: 'electricParticlePlanetScan',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'electricParticlePlanetInfo',
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

			chapter: 'gravity-electric',
			textIntro: 'G || E\n\n----------\n\nChange the sign of the particles contained in the big circles to counterbalace their attractive force.\n\nClick and drag up or down.\n\nClick to start',

			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					maxInstancesNum: 3,
					textAlign: 'bottom',


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

                        1: {

                        	name: 'electricPlanet',
                        	infoPointIndex: 16 * 7 + 4,
                        	particles: [ 1, 3, 6, 12, 12 ],
                            position: [ 2, 0, 0 ],
                            radius: 3.5,
                            mass: 1000000,
                            scale: [ 1.8, 1.8, 1.8 ],
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
					renderOrder: 3,

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

							name: 'electricParticlePlanetScan',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'electricParticlePlanetInfo',
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

			chapter: 'gravity-electric',
			textIntro: 'G || E\n\n----------\n\nChange the sign of the particles contained in the big circles to counterbalace their attractive force.\n\nClick and drag up or down.\n\nClick to start',

			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					maxInstancesNum: 4,
					textAlign: 'bottom',


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

							name: 'electricPlanet',
                        	infoPointIndex: 16 * 7 + 1,
                        	particles: [ 1, 3, 6, 7 ],
                            position: [ -2, -2, 0 ],
                            radius: 3.5,
                            mass: 10000,
                            charge: 10,
                            sign: -1,
                            scale: [ 1, 1, 1 ],
                            color: [ 0.8, 0.8, 0.8, 1 ],

                        },

                        1: {

                        	name: 'electricPlanet',
                        	infoPointIndex: 16 * 7 + 2,
                        	particles: [ 1, 3, 6, 16 ],
                            position: [ -2, 2, 0 ],
                            radius: 3.5,
                            mass: 1000000,
                            charge: 25,
                            scale: [ 1.4, 1.4, 1.4 ],
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
					maxInstancesNum: 150,
					renderOrder: 3,

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

							name: 'electricParticlePlanetScan',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'electricParticlePlanetInfo',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {}

				},

				obstacles: {

					elementType: 'Obstacle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 2,
					buildFromInstances: true,
					renderOrder: 2,

					shaders: {

						main: null,

						normal: {

							name: 'obstacle',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'obstacleScan',
							transparent: true,
							uniforms: {},

						},

						infos: {

							name: 'obstacleInfo',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

                        1: {

                            position: [ -2, 0, 0.0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 2.5, 0.12, 0.1 ],
                            rotation: [ 0, 0, 0],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

					}

				},

			}

		},

		3: {

			chapter: 'gravity-electric',
			textIntro: 'G || E\n\n----------\n\nChange the sign of the particles contained in the big circles to counterbalace their attractive force.\n\nClick and drag up or down.\n\nClick to start',

			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					maxInstancesNum: 4,
					textAlign: 'bottom',


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

							name: 'electricPlanet',
                        	infoPointIndex: 16 * 7 + 4,
                        	particles: [ 1, 3, 6, 7 ],
                            position: [ 2, -2, 0 ],
                            radius: 3.5,
                            mass: 10000,
                            charge: 15,
                            maxCharge: 30,
                            sign: -1,
                            scale: [ 1, 1, 1 ],
                            color: [ 0.8, 0.8, 0.8, 1 ],

                        },

                        1: {

                        	name: 'electricPlanet',
                        	infoPointIndex: 16 * 7 + 2,
                        	particles: [ 1, 3, 6, 7 ],
                            position: [ -2, 2, 0 ],
                            radius: 3.5,
                            mass: 1000000,
                            charge: 25,
                            sign: -1,
                            scale: [ 1, 1, 1 ],
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
					maxInstancesNum: 150,
					renderOrder: 3,

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

							name: 'electricParticlePlanetScan',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

						infos: {

							name: 'electricParticlePlanetInfo',
							transparent: true,
							textureUrl: './resources/textures/generic_circle_sdf.png',
							uniforms: {},

						},

					},


					instances: {}

				},

				obstacles: {

					elementType: 'Obstacle',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 2,
					buildFromInstances: true,
					renderOrder: 2,

					shaders: {

						main: null,

						normal: {

							name: 'obstacle',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

						scan: {

							name: 'obstacleScan',
							transparent: true,
							uniforms: {},

						},

						infos: {

							name: 'obstacleInfo',
							transparent: true,
							textureUrl: './resources/textures/generic_obstacle_sdf.png',
							uniforms: {},

						},

					},


					instances: {

                        1: {

                            position: [ 1, 1, 0.0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 1.4, 0.12, 0.1 ],
                            rotation: [ 0, 0, Math.PI * -0.25 ],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

                        2: {

                            position: [ -1, -1, 0.0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 1.4, 0.12, 0.1 ],
                            rotation: [ 0, 0, Math.PI * -0.25 ],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

					}

				},

			}

		},

	}

}

export { levels };
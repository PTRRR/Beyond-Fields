let levels = {

	gravity: {

		0: {

			chapter: 'gravity',
			textIntro: 'G\n\n1\n\nDrag on the screen to place objects along the particles stream to change its trajectory\n\nTry to direct it to the target\n\nClick to start',
			playerDrag: 0.9855,
			elements: {

				blackMatter: {

					elementType: 'BlackMatter',
					static: false,
					manualMode: false,
					transparent: true,
					individual: false,
					maxInstancesNum: 108,
					renderOrder: 3,
					drawInfos: true,
					lineInfo: 'top',

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

				},

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					lineInfo: 'bottom',

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

					}

				},

			}

		},

		1: {

			chapter: 'gravity',
			textIntro: 'G\n\n2\n\nDrag on the screen to place objects along the particles stream to change its trajectory \n\nTry to direct it to the target\n\nClick to start',
			elements: {

				planets: {

					elementType: 'Planet',
					static: true,
					manualMode: false,
					transparent: true,
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					lineInfo: 'bottom',
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

							manualPointIndex: 0,
							enabled: true,
                            position: [ -2, 0, 0 ],
                            radius: 4,
                            mass: 500000,
                            scale: [ 1.8, 1.8, 1.8 ],
                            color: [ 255/255, 222/255, 40/255, 1 ],
                            rotation: [ 0, 0, 0 ],
                            canDye: false,

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
			textIntro: 'G\n\n3\n\nDrag on the screen to place objects along the particles stream to change its trajectory\n\nTry to direct it to the target\n\nClick to start',
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
					lineInfo: 'bottom',

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

							manualPointIndex: 2,
                            position: [ 1.8, 0, 0 ],
                            radius: 2,
                            mass: 10000,
                            scale: [ 0.6, 0.6, 0.6 ],
                            color: [ 245/255, 30/255, 30/255, 1 ],

                        },

                        2: {

                        	manualPointIndex: 0,
                            position: [ -1.5, 1.5, 0 ],
                            radius: 2,
                            mass: 1000000,
                            scale: [ 1.0, 1.0, 1.0 ],
                            color: [ 180/255, 180/255, 180/255, 1 ],

                        },

                        3: {

                        	manualPointIndex: 1,
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

		3: {

			chapter: 'gravity',
			textIntro: 'G\n\n4\n\nDrag on the screen to place objects along the particles stream to change its trajectory\n\nTry to direct it to the target\n\nClick to start',
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
					lineInfo: 'bottom',

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

							manualPointIndex: 1,
                            position: [ 0, 0, 0 ],
                            radius: 2,
                            mass: 10000,
                            scale: [ 0.6, 0.6, 0.6 ],
                            color: [ 255/255, 222/255, 40/255, 1 ],

                        },

                        1: {

                        	manualPointIndex: 2,
                            position: [ 1.8, -1.8, 0 ],
                            radius: 2,
                            mass: 500000,
                            scale: [ 1.0, 1.0, 1.0 ],
                            color: [ 229/255, 36/255, 31/255, 1 ],

                        },

                        2: {

                        	manualPointIndex: 0,
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

		4: {

			chapter: 'gravity',
			textIntro: 'G\n\n5\n\nDrag on the screen to place objects along the particles stream to change its trajectory\n\nTry to direct it to the target\n\nClick to start',
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
					lineInfo: 'bottom',

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

							manualPointIndex: 0,
                            position: [ -2.0, 0, 0 ],
                            radius: 2,
                            mass: 600000,
                            scale: [ 2.5, 2.5, 2.5 ],
                            color: [ 229/255, 36/255, 31/255, 1 ],

                        },

                        1: {

                        	manualPointIndex: 2,
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

	},

	electric: {

		0: {

			chapter: 'electric',
			textIntro: 'E\n\n1\n\nClick and drag up or down to change the attractors polarity\n\nTry to direct the particles stream to the target by adding some attractors\n\nClick to start',
			legend: '0: Attractors number\n1: Total charge [C]\n2: Resulting force on player [N]',
			playerDrag: 0.9855,
			elements: {

				fixedCharges: {

					elementType: 'ElectricParticle',
					static: true,
					manualMode: false,
					transparent: true,
					renderOrder: 1,
					buildFromInstances: true,
					drawInfos: true,
					maxInstancesNum: 0,

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

					instances: {}

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
			textIntro: 'E\n\n2\n\nClick and drag up or down to change the attractors polarity and balace the forces emittet by the static attractors\n\nTry to direct the particles stream to the target\n\nClick to start',
			legend: '0: Attractors number\n1: Total charge [C]\n2: Resulting force on player [N]',
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
					maxInstancesNum: 1,
					lineInfo: 'bottom',

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

							manualPointIndex: 1,
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
			textIntro: 'E\n\n3\n\nClick and drag up or down to change the attractors polarity\n\nTry to direct the particles stream to the target and avoid obstacles\n\nClick to start',
			legend: '0: Attractors number\n1: Total charge [C]\n2: Resulting force on player [N]',
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


					instances: {}

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
			textIntro: 'E\n\n4\n\nClick and drag up or down to change the attractors polarity and balace the forces emittet by the static attractors\n\nTry to direct the particles stream to the target and avoid obstacles\n\nClick to start',
			legend: '0: Attractors number\n1: Total charge [C]\n2: Resulting force on player [N]',
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
					lineInfo: 'bottom',

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

							manualPointIndex: 1,
							enabled: false,
                            position: [ 0, 0, 0 ],
                            radius: 0,
                            targetRadius: 0.6,
                            mass: 500000,
                            rotation: [ 0, 0, Math.random () * Math.PI * 2 ],
                            sign: -1,

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
			textIntro: 'E\n\n5\n\nClick and drag up or down to change the attractors polarity\n\nTry to direct the particles stream to the target and avoid obstacles\n\nClick to start',
			legend: '0: Attractors number\n1: Total charge [C]\n2: Resulting force on player [N]',
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

	'gravity-electric': {

		0: {

			chapter: 'gravity-electric',
			textIntro: 'G & E\n\n1\n\nClick on the attractors and drag up or down to compensate their exerted force\n\nTry to direct the particles stream to the target.\n\nClick to start',
			legend: '0: Attractors number\n1: Total charge [C]\n2: Total mass [kg]\n3: Resulting force on player [N]',
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
					lineInfo: 'bottom',


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
                        	manualPointIndex: 1,
                        	particles: [ 1, 3, 6, 12, 12 ],
                            position: [ 2, 0, 0 ],
                            radius: 3.5,
                            mass: 1000000,
                            scale: [ 1.8, 1.8, 1.8 ],
                            color: [ 0.8, 0.8, 0.8, 1 ],
                            targetCharge: 27,

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
			textIntro: 'G & E\n\n2\n\nClick on the attractors and drag up or down to compensate their exerted force\n\nTry to direct the particles stream to the target.\n\nClick to start',
			legend: '0: Attractors number\n1: Total charge [C]\n2: Total mass [kg]\n3: Resulting force on player [N]',
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
					lineInfo: 'bottom',


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
							manualPointIndex: 0,
							particles: [ 1, 3, 6, 12 ],
                            position: [ -2, 0, 0 ],
                            radius: 4,
                            mass: 10000,
                            scale: [ 1.3, 1.3, 1.3 ],
                            color: [ 0.8, 0.8, 0.8, 1 ],
                            targetCharge: 25,

                        },

                        1: {

                        	name: 'electricPlanet',
                        	manualPointIndex: 1,
                        	particles: [ 1, 3, 6, 12 ],
                            position: [ 2, 0, 0 ],
                            radius: 3.5,
                            mass: 10000,
                            scale: [ 1.3, 1.3, 1.3 ],
                            color: [ 0.8, 0.8, 0.8, 1 ],
                            targetCharge: -25,

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
			textIntro: 'G & E\n\n3\n\nClick on the attractors and drag up or down to compensate their exerted force\n\nTry to direct the particles stream to the target.\n\nClick to start',
			legend: '0: Attractors number\n1: Total charge [C]\n2: Total mass [kg]\n3: Resulting force on player [N]',
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
					lineInfo: 'bottom',


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
                        	manualPointIndex: 2,
                        	particles: [ 1, 3, 6, 7 ],
                            position: [ -2, -2, 0 ],
                            radius: 3.5,
                            mass: 10000,
                            targetCharge: 10,
                            scale: [ 1, 1, 1 ],
                            color: [ 0.8, 0.8, 0.8, 1 ],

                        },

                        1: {

                        	name: 'electricPlanet',
                        	manualPointIndex: 3,
                        	particles: [ 1, 3, 6, 16 ],
                            position: [ -2, 2, 0 ],
                            radius: 3.5,
                            mass: 1000000,
                            targetCharge: -20,
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
			textIntro: 'G & E\n\n4\n\nClick on the attractors and drag up or down to compensate their exerted force\n\nTry to direct the particles stream to the target.\n\nClick to start',
			legend: '0: Attractors number\n1: Total charge [C]\n2: Total mass [kg]\n3: Resulting force on player [N]',
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
					lineInfo: 'bottom',


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
                        	manualPointIndex: 1,
                        	particles: [ 1, 3, 6, 7 ],
                            position: [ 2, -2, 0 ],
                            radius: 3.5,
                            mass: 10000,
                            targetCharge: 2,
                            maxCharge: 15,
                            scale: [ 1, 1, 1 ],
                            color: [ 0.8, 0.8, 0.8, 1 ],

                        },

                        1: {

                        	name: 'electricPlanet',
                        	manualPointIndex: 0,
                        	particles: [ 1, 3, 6, 7 ],
                            position: [ -2, 2, 0 ],
                            radius: 3.5,
                            mass: 1000000,
                            targetCharge: -25,
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

		4: {

			chapter: 'gravity-electric',
			textIntro: 'G & E\n\n4\n\nClick on the attractors and drag up or down to compensate their exerted force\n\nTry to direct the particles stream to the target.\n\nClick to start',
			legend: '0: Attractors number\n1: Total charge [C]\n2: Total mass [kg]\n3: Resulting force on player [N]',
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
					lineInfo: 'bottom',


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
                        	manualPointIndex: 0,
                        	particles: [ 1, 3, 6, 7 ],
                            position: [ -2, 0, 0 ],
                            radius: 3.5,
                            mass: 10000,
                            charge: 0,
                            maxCharge: 30,
                            scale: [ 1, 1, 1 ],
                            color: [ 0.8, 0.8, 0.8, 1 ],

                        },

                        1: {

                        	name: 'electricPlanet',
                        	manualPointIndex: 1,
                        	particles: [ 1, 3, 6, 7 ],
                            position: [ 2, 2.5, 0 ],
                            radius: 3.5,
                            mass: 1000000,
                            charge: 0,
                            scale: [ 1, 1, 1 ],
                            color: [ 0.8, 0.8, 0.8, 1 ],

                        },

                        2: {

                        	name: 'electricPlanet',
                        	manualPointIndex: 2,
                        	particles: [ 1, 3, 6, 7 ],
                            position: [ 2, -2.5, 0 ],
                            radius: 3.5,
                            mass: 1000000,
                            charge: 0,
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

                            position: [ -0.1, 0, 0.0 ],
                            radius: 2,
                            mass: 100000,
                            scale: [ 0.8, 0.12, 0.1 ],
                            rotation: [ 0, 0, 0 ],
                            color: [ 0.7, 0.7, 0.7, 1 ],

                        },

					}

				},

			}

		},

	}

}

export { levels };
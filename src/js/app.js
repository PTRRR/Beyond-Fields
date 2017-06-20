import { resourcesList } from "./resourcesList";
import { GameManager } from "./GameManager";
import { SoundManager } from "./SoundManager";
import { addEvent, removeEvent } from "./utils";
import { levels } from "./levels";
import { IntroScene } from "./IntroScene";

// Loop utility

let loop = require ( 'raf-loop' );

( function () {

	function init ( _soundManager ) {

		setTimeout ( function () {

			// backSound.volume = 1.0;

		}, 1000 );

		// Cross browser variables

		let performance = window.performance || {};
		performance.now = ( function() {

		  	let _now = Date.now();
		  	return performance.now    ||
		  	performance.webkitNow     ||
		  	performance.msNow         ||
		  	performance.oNow          ||
		  	performance.mozNow        ||
		  	function() { return Date.now() - _now; };

		})();

		window.performance = performance;

		if ( !window.requestAnimationFrame ) {

			window.requestAnimationFrame = ( function() {

				return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

					window.setTimeout( callback, 1000 / 60 );

				};

			} )();

		}

		// Build GUI

		let isRuning = false;
		let pagesStack = [];
		let backPage = null;
		let backAction = false;
		let pages = document.querySelectorAll('.page');
		let mainMenu = document.querySelector('#main-menu');
		let loadingPanel = document.querySelector('#loading-panel');
		let loadingLevelPanel = document.querySelector('#loading-level-panel');

		// update levels

		for ( let level in levels ) {

			for ( let n in levels[ level ] ) {

				levels[ level ][ n ][ 'levelIndex' ] = parseInt ( n ) + 1;

			}

		}

		// Set events on the buttons.

		for ( let i = 0; i < pages.length; i ++ ) {

			let buttons = pages[ i ].querySelectorAll('.button');

			for ( let j = 0; j < buttons.length; j ++ ) {

				if ( WURFL.is_mobile === true ) {

					( function ( button ) {

						button.addEventListener ( 'touchstart', function () {

							let onMouseUp = function () {

								if ( button.attributes.target ) {

									let target = button.attributes.target.value;
									let currentPage = document.querySelector('.page-active');
									setPageActive ( document.querySelector( '#' + target ) );
									backPage = currentPage;
									button.removeEventListener ( 'touchend', onMouseUp );

									if ( button.attributes.chapter ) {

										let chapter = button.attributes.chapter.value;
										let level = button.attributes.level.value;

										loadingLevelPanel.style.opacity = 1;
										loadingLevelPanel.style.pointerEvents = 'auto';

										setTimeout ( function () {

											gameManager.startLevel ( levels[ chapter ][ level ], function () {

												isRuning = true;

												setTimeout ( function () {

													loadingLevelPanel.style.opacity = 0;
													loadingLevelPanel.style.pointerEvents = 'none';

												}, 500 );

											} );

										}, 500 );

									}

								}

							}
							
							button.addEventListener ( 'touchend', onMouseUp );

						} );

					} )( buttons[ j ] );

				} else {

					( function ( button ) {

						button.addEventListener ( 'mousedown', function () {

							let onMouseUp = function () {

								if ( button.attributes.target ) {

									let target = button.attributes.target.value;
									let currentPage = document.querySelector('.page-active');
									setPageActive ( document.querySelector( '#' + target ) );
									backPage = currentPage;
									button.removeEventListener ( 'mouseup', onMouseUp );

									if ( button.attributes.chapter ) {

										let chapter = button.attributes.chapter.value;
										let level = button.attributes.level.value;

										loadingLevelPanel.style.opacity = 1;
										loadingLevelPanel.style.pointerEvents = 'auto';

										setTimeout ( function () {

											gameManager.startLevel ( levels[ chapter ][ level ], function () {

												isRuning = true;

												setTimeout ( function () {

													loadingLevelPanel.style.opacity = 0;
													loadingLevelPanel.style.pointerEvents = 'none';

												}, 500 );

											} );
											
										}, 500 );

									}

								}

							}
							
							button.addEventListener ( 'mouseup', onMouseUp );

						} );

					} )( buttons[ j ] );

				}

			}

		}

		// setPageActive ( mainMenu );

		function setPageActive ( _page, _onTransitionEnd ) {

			let activePage = document.querySelector('.page-active');

			if ( activePage ) {

				if ( !backAction ) pagesStack.push ( activePage );
				backAction = false;
				setPageUnactive ( activePage );

			}

			if ( !_page.className.match(/(?:^|\s)page-active(?!\S)/) ) {

				switch ( _page.id ) {

					case 'main-menu':

						setTimeout ( function () {

							introScene.initMainMenu ();

						}, 500 );

					break;

					case 'gravity-levels':

						setTimeout ( function () {

							introScene.initGravity ();

						}, 500 );

					break;

					case 'electric-levels':

						setTimeout ( function () {

							introScene.initElectric ();

						}, 500 );

					break;

					case 'gravity-electric-levels':

						setTimeout ( function () {

							introScene.initGravityElectric ();

						}, 500 );

					break;

				}

				_page.className += ' page-active';

				if ( _page.attributes.back ) {

					backPage = document.querySelector ( '#' + _page.attributes.back.value );

				} else {

					backPage = null;

				}
				
				if ( _onTransitionEnd ) {

					addEvent ( _page, 'transitionend', function () {

						var onTransitionEnd = function () {

							_onTransitionEnd ();
							removeEvent ( { elem: _page, event: 'transitionend', handler: onTransitionEnd} );						

						}

						addEvent ( _page, 'transitionend', onTransitionEnd );

					} );

				}

			}

			if ( backPage ) {

				backButton.style.opacity = 1;
				backButton.style.pointerEvents = 'auto';

			} else {

				backButton.style.opacity = 0;
				backButton.style.pointerEvents = 'none';

			}

		}

		function setPageUnactive ( _page, _onTransitionEnd ) {

			if ( _page.className.match(/(?:^|\s)page-active(?!\S)/) ) {

				_page.className = _page.className.replace( /(?:^|\s)page-active(?!\S)/g , '' );

				if ( _onTransitionEnd ) {

					var onTransitionEnd = function () {

						_onTransitionEnd ();
						removeEvent ( { elem: _page, event: 'transitionend', handler: onTransitionEnd} );						

					}

					addEvent ( _page, 'transitionend', onTransitionEnd );

				}

			}

		}

		function setAllPagesUnactive () {

			let pages = document.querySelectorAll('.pages');
			for ( let i = 0; i < pages.length; i ++ ) {

				setPageUnactive ( page[ i ] );

			}

		}

		// Top Bar

		let backButton = document.querySelector('#back-button');

		if ( WURFL.is_mobile === true ) {

			backButton.addEventListener ( 'touchstart', function () {

				let onMouseUp = function () {

					backAction = true;
					setPageActive ( backPage );
					isRuning = false;
					backButton.removeEventListener ( 'touchend', onMouseUp );

				}
				
				backButton.addEventListener ( 'touchend', onMouseUp );

			} );

		} else {

			backButton.addEventListener ( 'mousedown', function () {

				let onMouseUp = function () {

					backAction = true;
					setPageActive ( backPage );
					isRuning = false;
					backButton.removeEventListener ( 'mouseup', onMouseUp );

				}
				
				backButton.addEventListener ( 'mouseup', onMouseUp );

			} );

		}

		let reloadButton = document.querySelector('#reload-button');
		addEvent ( reloadButton, 'click', function () {

			gameManager.reloadLevel ();

		} );

		// General

		let renderer = new THREE.WebGLRenderer();
		let gl = renderer.getContext ();

		let devicePixelRatio = window.devicePixelRatio;
		if ( devicePixelRatio > 1.5 ) {

			devicePixelRatio = 1.5;

		}

		renderer.setPixelRatio ( devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );

		let rendererElement = renderer.domElement;
		rendererElement.className = 'main-canvas';
		document.body.appendChild( rendererElement );

		let stats = new Stats();
		stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		// document.body.appendChild( stats.dom );

		// Events

		let down = false;
		let lastPos = vec2.create();

		// Cross mouse & touch

		addEvent ( rendererElement, 'click', function ( event ) {

			let pos = vec2.fromValues ( event.clientX, event.clientY );
			gameManager.onClick ( vec2.fromValues ( event.clientX, event.clientY ) );
			lastPos = pos;

		} );

		addEvent ( window, 'dbclick', function ( event ) {

			event.preventDefault ? event.preventDefault() : (event.returnValue = false);

		} );

		// Mouse

		addEvent ( rendererElement, 'mousedown', function ( event ) {

			down = true;
			event.preventDefault ? event.preventDefault() : (event.returnValue = false);

			let pos = vec2.fromValues ( event.clientX, event.clientY );
			gameManager.onDown ( vec2.fromValues ( event.clientX, event.clientY ) );
			lastPos = pos;			

		} );

		addEvent ( rendererElement, 'mouseup', function ( event ) {

			down = false
			event.preventDefault ? event.preventDefault() : (event.returnValue = false);

			gameManager.onUp ( lastPos );			

		} );

		addEvent ( rendererElement, 'mousemove', function ( event ) {

			event.preventDefault ? event.preventDefault() : (event.returnValue = false);

			let pos = vec2.fromValues ( event.clientX, event.clientY );
			gameManager.onMove ( vec2.fromValues ( event.clientX, event.clientY ) );

			if ( down ) {

				gameManager.onDrag ( vec2.fromValues ( event.clientX, event.clientY ) );

			}

			lastPos = pos;

		} );

		// Touch

		addEvent ( rendererElement, 'touchstart', function ( event ) {

			down = true;
			event.preventDefault ? event.preventDefault() : (event.returnValue = false);

			let pos = vec2.fromValues ( event.touches[ 0 ].clientX, event.touches[ 0 ].clientY );
			gameManager.onDown ( pos );
			lastPos = pos;

		} );

		addEvent ( rendererElement, 'touchend', function ( event ) {

			down = false;
			event.preventDefault ? event.preventDefault() : (event.returnValue = false);

			gameManager.onUp ( lastPos );

		} );

		addEvent ( window, 'touchmove', function ( event ) {

			event.preventDefault ? event.preventDefault() : (event.returnValue = false);

		} );

		addEvent ( rendererElement, 'touchmove', function ( event ) {

			event.preventDefault ? event.preventDefault() : (event.returnValue = false);
			let pos = vec2.fromValues ( event.touches[ 0 ].clientX, event.touches[ 0 ].clientY );
			gameManager.onMove ( pos );

			if ( down ) {

				gameManager.onDrag ( pos );

			}

			lastPos = pos;

		} );

		// Window events

		addEvent ( window, 'resize', function () {

			gameManager.onResize ();
			introScene.onResize ();

		} );
		
		// Game

		let gameManager = new GameManager ( { renderer: renderer, soundManager: _soundManager } );

		gameManager.onWin ( function ( levelFile ) {

			( function ( chapter, level ) {

				let winPage = null;

				switch ( chapter ) {

					case 'gravity':

						winPage = document.querySelector('#gravity-end');

					break;

					case 'electric':

						winPage = document.querySelector('#electric-end');

					break;

					case 'gravity-electric':

						winPage = document.querySelector('#gravity-electric-end');

					break;

				}

				let content = winPage.querySelector('.content');
				let levelInfo = content.querySelector('.level-info');
				levelInfo.innerHTML = 'Level ' + level + ' completed!';
				let nextLevel = content.querySelector('.next-level');

				if ( nextLevel ) content.removeChild ( nextLevel );

				let newNextLevelButton = document.createElement('div');
				newNextLevelButton.className = 'next-level';
				newNextLevelButton.innerHTML = 'Next level';
				newNextLevelButton.style.cursor = 'pointer';

				let nextLevelFile = levels[ chapter ][ level ] || levels[ chapter ][ 0 ];

				newNextLevelButton.addEventListener ( 'mousedown', function () {

					let onMouseUp = function () {

						setPageActive ( document.querySelector( '#' + chapter + '-blank' ) );
						backPage = document.querySelector('#' + chapter + '-levels');;
						loadingLevelPanel.style.opacity = 1;
						loadingLevelPanel.style.pointerEvents = 'auto';

						setTimeout ( function () {

							gameManager.startLevel ( nextLevelFile, function () {

								isRuning = true;

								setTimeout ( function () {

									loadingLevelPanel.style.opacity = 0;
									loadingLevelPanel.style.pointerEvents = 'none';

								}, 500 );

							} );
							
						}, 500 );

						newNextLevelButton.removeEventListener ( 'mouseup', onMouseUp );

					}

					newNextLevelButton.addEventListener ( 'mouseup', onMouseUp );

				} );

				content.appendChild ( newNextLevelButton );

				setTimeout ( function () {

					setPageActive ( winPage );

				}, 300 );

			} )( levelFile.chapter, levelFile.levelIndex );

		} );

		// Create intro scene

		let introScene = new IntroScene ( { renderer: renderer, soundManager: _soundManager } );
		let mainBackgroundSound = null;
		let mainPlayerSound = _soundManager.play ( 'Player_sound_0', { loop: -1, volume: 0 } );

		// Delay all transition in order to prevent overloading the gpu.

		introScene.build ( function () {

			setTimeout ( function () {

				setPageUnactive ( loadingPanel, function () {

					setTimeout ( function () {

						// Init the intro scene and set a callback that will be fired when the players hit the target.

						introScene.initIntro ( function () {

							_soundManager.play ( 'Gong_sound_3', { volume: 0.2 } );
							_soundManager.play ( 'Gong_sound_1', { volume: 0.2 } );
							_soundManager.play ( 'Triangle_sound_1', { volume: 0.2 } );
							_soundManager.play ( 'Hit_sound_' + Math.floor ( Math.random () * 5 ), { volume: 0.1 } );
							mainBackgroundSound = _soundManager.play ( 'Back_sound_' + Math.floor ( Math.random () * 4 ), { loop: -1 } );

							setTimeout ( function () {

								// setPageActive ( document.querySelector('#gravity-end') );
								setPageActive ( mainMenu );

							}, 100 );

						} );

					}, 100 );

				} );

			}, 300 );

		} );

		function update ( _deltaTime ) {

			if ( isRuning ) {

				gameManager.update ( _deltaTime );
				mainPlayerSound.volume += ( 0.0 - mainPlayerSound.volume ) * 0.03;
				if ( mainBackgroundSound ) mainBackgroundSound.volume += ( 0.0 - mainBackgroundSound.volume ) * 0.08;

			} else {

				introScene.update ();
				mainPlayerSound.volume += ( 0.15 - mainPlayerSound.volume ) * 0.03;
				if ( mainBackgroundSound ) mainBackgroundSound.volume += ( 1.0 - mainBackgroundSound.volume ) * 0.08;
				
			}

		}

		function render ( _deltaTime ) {
			
			if ( isRuning ) {

				gameManager.render ( _deltaTime );
				
			} else {

				introScene.render ();
				
			}

		}

		var mainLoop = loop ( function ( deltaTime ) {

			stats.begin ();

			update ( deltaTime );
			render ( deltaTime );

			stats.end ();

		} ).start ();

	}

	let soundManager = new SoundManager ();
	soundManager.onLoad ( function () {

		init ( this );

	} );

} )();
import { resourcesList } from "./resourcesList";
import { GameManager } from "./GameManager";
import { addEvent, removeEvent } from "./utils";
import { levels } from "./levels";
import { IntroScene } from "./IntroScene";

// Loop utility

let loop = require ( 'raf-loop' );

( function () {

	function init () {

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
		document.body.appendChild( stats.dom );

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

		let gameManager = new GameManager ( { renderer: renderer } );

		// Debug

		// gameManager.startLevel ( levels[ 'gravity' ][ 0 ], function () {

		// 	setTimeout ( function () {

		// 		menu.classList.add ( 'hidden' );
		// 		activePage.classList.remove ( 'active' );

		// 	}, 200 );

		// } );

		// gameManager.startLevel ( levels[ 'electric' ][ 2 ], function () {

		// 	setTimeout ( function () {

		// 		menu.classList.add ( 'hidden' );
		// 		activePage.classList.remove ( 'active' );

		// 	}, 200 );

		// } );

		// gameManager.startLevel ( levels[ 'gravityElectric' ][ 3 ], function () {

		// 	setTimeout ( function () {

		// 		menu.classList.add ( 'hidden' );
		// 		activePage.classList.remove ( 'active' );

		// 	}, 200 );

		// } );
		// gameManager.startLevel ( levels[ 'electric' ][ 0 ] );
		// gameManager.startLevel ( levels[ 'gravityElectric' ][ 0 ] );

		// Create intro scene

		let introScene = new IntroScene ( renderer );

		// Delay all transition in order to prevent overloading the gpu.

		introScene.build ( function () {

			setTimeout ( function () {

				setPageUnactive ( loadingPanel, function () {

					setTimeout ( function () {

						// Init the intro scene and set a callback that will be fired when the players hit the target.

						introScene.initIntro ( function () {

							setTimeout ( function () {

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
				
			} else {

				introScene.update ();
				
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

	init ();

} )();
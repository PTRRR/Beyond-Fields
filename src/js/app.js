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

		let pagesStack = [];
		let pages = document.querySelectorAll('.page');
		let mainMenu = document.querySelector('#main-menu');
		let loadingPanel = document.querySelector('#loading-panel');
		let loadingLevelPanel = document.querySelector('#loading-level-panel');

		for ( let i = 0; i < pages.length; i ++ ) {

			let buttons = pages[ i ].querySelectorAll('.button');

			for ( let j = 0; j < buttons.length; j ++ ) {

				if ( WURFL.is_mobile === true ) {

					addEvent ( buttons[ j ], 'touchstart', function () {

						var onTouchEnd = function () {

							let target = this.attributes.target.value;
							setPageActive ( document.querySelector ( '#' + target ) );
							removeEvent ( { elem: this, event: 'touchend', handler: onTouchEnd } );

						}

						addEvent ( this, 'touchend', onTouchEnd );

					} );

				} else {

					addEvent ( buttons[ j ], 'mousedown', function () {

						var onMouseUp = function () {

							let target = this.attributes.target.value;
							setPageActive ( document.querySelector ( '#' + target ) );
							removeEvent ( { elem: this, event: 'mouseup', handler: onMouseUp } );

						}

						addEvent ( this, 'mouseup', onMouseUp );

					} );

				}

			}

		}

		// setPageActive ( mainMenu );

		function setPageActive ( _page, _onTransitionEnd ) {

			let activePage = document.querySelector('.page-active');

			if ( activePage ) {

				setPageUnactive ( activePage );

			}

			if ( !_page.className.match(/(?:^|\s)page-active(?!\S)/) ) {

				_page.className += ' page-active';
				
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

		let backButton = document.querySelector('#back-button');
		addEvent ( backButton, 'click', function () {

			menu.classList.remove ( 'hidden' );
			gameManager.end();
			makePageActive ( 'home' );

		} );

		let reloadButton = document.querySelector('#reload-button');
		addEvent ( reloadButton, 'click', function () {

			gameManager.reloadLevel ();

		} );

		// General

		let renderer = new THREE.WebGLRenderer( { alpha: true } );
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
		introScene.onEnd ( function () {

			setTimeout ( function () {

				setPageActive ( mainMenu );

			}, 50 );

		} );
		
		setTimeout ( function () {

			setPageUnactive ( loadingPanel, function () {

				setTimeout ( function () {

					introScene.init ();

				}, 10 );

			} );

		}, 500 );

		function update ( _deltaTime ) {

			gameManager.update ( _deltaTime );
			introScene.update ();

		}

		function render ( _deltaTime ) {
			
			gameManager.render ( _deltaTime );
			introScene.render ();

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
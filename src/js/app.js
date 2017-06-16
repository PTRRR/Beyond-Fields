import { resourcesList } from "./resourcesList";
import { GameManager } from "./GameManager";
import { addEvent } from "./utils";
import { levels } from "./levels";

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

		let menu = document.querySelector('#menu');
		let activePage = document.querySelector('.active');
		let pages = document.querySelectorAll('.page');
		let levelsPages = document.querySelectorAll('.levels');

		for ( let i = 0; i < levelsPages.length; i ++ ) {

			let file = levelsPages[ i ].attributes.file.value;

			for ( let level in levels[ file ] ) {

				let levelElement = document.createElement('div');
				levelElement.classList.add ( 'button' );
				let content = document.createElement('div');
				content.classList.add ( 'content' );
				let title = document.createElement('h2');
				title.classList.add ( 'title' );
				title.innerHTML = level;
				content.appendChild ( title );
				levelElement.appendChild ( content );
				levelsPages[ i ].appendChild( levelElement );
				
				addEvent ( levelElement, 'click', function () {

					gameManager.startLevel ( levels[ file ][ level ], function () {

						menu.classList.add ( 'hidden' );
						activePage.classList.remove ( 'active' );

					} );

				} );

			}

		}

		for ( let i = 0; i < pages.length; i ++ ) {

			let buttons = pages[ i ].querySelectorAll('.button');

			for ( let j = 0; j < buttons.length; j ++ ) {

				let button = buttons[ j ];
				button.style.height = ( 100 / buttons.length ) + "%";

				if ( button.attributes.target ) {

					let target = button.attributes.target.value;

					addEvent ( button, 'click', function () {

						makePageActive ( target );

					} );

				}

			}

		}

		function makePageActive ( _target ) {

			activePage.classList.remove("active");
			activePage = document.querySelector('#' + _target);
			activePage.classList.add ( 'active' );

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

		// gameManager.startLevel ( levels[ 'electric' ][ 3 ], function () {

		// 	setTimeout ( function () {

		// 		menu.classList.add ( 'hidden' );
		// 		activePage.classList.remove ( 'active' );

		// 	}, 200 );

		// } );

		gameManager.startLevel ( levels[ 'gravityElectric' ][ 0 ], function () {

			setTimeout ( function () {

				menu.classList.add ( 'hidden' );
				activePage.classList.remove ( 'active' );

			}, 200 );

		} );
		// gameManager.startLevel ( levels[ 'electric' ][ 0 ] );
		// gameManager.startLevel ( levels[ 'gravityElectric' ][ 0 ] );

		function update ( _deltaTime ) {

			gameManager.update ( _deltaTime );

		}

		function render ( _deltaTime ) {
			
			gameManager.render ( _deltaTime );

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
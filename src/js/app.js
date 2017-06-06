import { resourcesList } from "./resourcesList";
import { GameManager } from "./GameManager";
import { addEvent } from "./utils";
import { levels } from "./levels";

( function () {

	function loadAllResources ( _resources, _onLoad ) {

		let loadedResources = {};

		if ( _resources instanceof Object ) {

			let numResources = 0;

			for ( let resource in _resources ) {

				let type = _resources[ resource ].type;
				let url = _resources[ resource ].url;

				loadedResources[ resource ] = {};
				loadedResources[ resource ].type = type;
				loadedResources[ resource ].url = url;

				switch ( type ) {

					case 'img':

						let image = new Image ();
						image.src = url;

						( function ( name ) {

							addEvent ( image, 'load', function () {

								loadedResources[ name ].element = this;

								numResources --;

								if ( numResources == 0 ) {

									_onLoad ( loadedResources );

								}

							} );

						} )( resource );

					break;

				}

				numResources ++;

			}

		} else {

			console.error ( 'APP ERROR: resources attribute must be an object!' );

		}

	}

	loadAllResources ( resourcesList, function ( _loadedResources ) {

		init ( _loadedResources );

	} );

	function init ( _loadedResources ) {

		// General

		let renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );

		let rendererElement = renderer.domElement;
		rendererElement.className = 'main-canvas';
		document.body.appendChild( rendererElement );

		let stats = new Stats();
		stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild( stats.dom );

		// Events

		addEvent ( rendererElement, 'click', function ( event ) {

			gameManager.onClick ( vec2.fromValues ( event.clientX, event.clientY ) );

		} );

		addEvent ( rendererElement, 'mousemove', function ( event ) {

			gameManager.onMove ( vec2.fromValues ( event.clientX, event.clientY ) );

		} );
		
		// Game

		let gameManager = new GameManager ( { renderer: renderer } );
		gameManager.startLevel ( levels.gravity[ 0 ] );

		function update () {


		}

		function render () {
			
			gameManager.render ();

		}

		function mainLoop () {

			stats.begin();

			update ();
			render ();

			stats.end();

			requestAnimationFrame ( mainLoop );

		}

		requestAnimationFrame ( mainLoop );		

	}

} )();
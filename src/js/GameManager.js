import { clone } from "./utils";
import { GravityLevel } from "./GameElements/GravityLevel";
import { ElectricLevel } from "./GameElements/ElectricLevel";
import { GravityElectricLevel } from "./GameElements/GravityElectricLevel";

export class GameManager {

	constructor ( _options ) {

		this.renderer = _options.renderer;

		// General

		this.currentLevel = null;
		this.soundManager = _options.soundManager;

	}

	onResize () {

		if ( this.currentLevel ) {

			this.currentLevel.onResize ();

		}

	}

	onMove ( _position ) {

		if ( this.currentLevel ) {

			this.currentLevel.onMove ( _position );

		}		

	}

	onDrag ( _position ) {

		if ( this.currentLevel ) {

			this.currentLevel.onDrag ( _position );

		}

	}

	onClick ( _position ) {

		if ( this.currentLevel ) {

			this.currentLevel.onClick ( _position );

		}

	}

	onDown ( _position ) {

		if ( this.currentLevel ) {

			this.currentLevel.onDown ( _position );

		}

	}

	onUp ( _position ) {

		if ( this.currentLevel ) {

			this.currentLevel.onUp ( _position );

		}

	}

	update ( _deltaTime ) {

		if ( this.currentLevel ) {

			this.currentLevel.update ( _deltaTime );
			
		}

	}

	render ( _deltaTime )  {

		if ( this.currentLevel ) {

			this.currentLevel.render ( _deltaTime );

		}

	}

	startLevel ( _levelFile, _onStart ) {

		this.end();

		// Create a new level according to the level file passed as an argument.

		switch ( _levelFile.chapter ) {

			case 'gravity':

				this.currentLevel = new GravityLevel ( { 

					renderer: this.renderer, 
					levelFile: clone ( _levelFile ),
					soundManager: this.soundManager,

				} );

			break;

			case 'electric':

				this.currentLevel = new ElectricLevel ( { 

					renderer: this.renderer, 
					levelFile: clone ( _levelFile ),
					soundManager: this.soundManager,

				} );

			break;

			case 'gravity-electric':

				this.currentLevel = new GravityElectricLevel ( { 

					renderer: this.renderer, 
					levelFile: clone ( _levelFile ),
					soundManager: this.soundManager,

				} );

			break;

		}

		if ( this.currentLevel ) {

			this.currentLevel.onLoad ( function () {

				if ( _onStart ) _onStart ();

			} );

			this.currentLevel.onWin ( function ( levelFile ) {

				if ( this.onWinCallBack ) this.onWinCallBack ( _levelFile );

			}.bind ( this ) )

		}

	}

	end () {

		if ( this.currentLevel ) {

			this.currentLevel.clearLevel ();
			delete this.currentLevel;
			this.currentLevel = null;

		}

	}

	onWin ( _callback ) {

		if ( !this.onWinCallBack ) this.onWinCallBack = _callback;

	}

	pauseCurrentLevel () {



	}

	endCurrentLevel () {

		this.currentLevel = null;

	}

	reloadLevel () {

		this.currentLevel.reloadLevel ();

	}

}
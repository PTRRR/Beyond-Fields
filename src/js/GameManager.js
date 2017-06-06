import { GravityLevel } from "./GameElements/GravityLevel";
import { ElectricLevel } from "./GameElements/ElectricLevel";
import { GravityElectricLevel } from "./GameElements/GravityElectricLevel";

export class GameManager {

	constructor ( _options ) {

		this.renderer = _options.renderer;

		// General

		this.currentLevel = null;

	}

	onMove ( _position ) {

		if ( this.currentLevel ) {

			this.currentLevel.onMove ( _position );

		}		

	}

	onClick ( _position ) {

		if ( this.currentLevel ) {

			this.currentLevel.onClick ( _position );

		}

	}

	update () {

		if ( this.currentLevel ) {

			this.currentLevel.update ();
			
		}

	}

	render ()  {

		if ( this.currentLevel ) {

			this.currentLevel.render ();

		}

	}

	startLevel ( _levelFile, _onStart ) {

		// Create a new level according to the level file passed as an argument.

		switch ( _levelFile.chapter ) {

			case 'gravity':

				this.currentLevel = new GravityLevel ( { 

					renderer: this.renderer, 
					levelFile: _levelFile,
					onStart: _onStart || function () { console.log ( 'Level Started' ) },

				} );

			break;

			case 'electric':

				this.currentLevel = new ElectricLevel ( { 

					renderer: this.renderer, 
					levelFile: _levelFile,
					onStart: _onStart || function () { console.log ( 'Level Started' ) },

				} );

			break;

			case 'gravity-electric':

				this.currentLevel = new GravityElectricLevel ( { 

					renderer: this.renderer, 
					levelFile: _levelFile,
					onStart: _onStart || function () { console.log ( 'Level Started' ) },

				} );

			break;

		}

	}

	pauseCurrentLevel () {



	}

	endCurrentLevel () {

		this.currentLevel = null;

	}

}
import { clone } from "./utils";
import { GravityLevel } from "./GameElements/GravityLevel";
import { ElectricLevel } from "./GameElements/ElectricLevel";
import { GravityElectricLevel } from "./GameElements/GravityElectricLevel";

export class GameManager {

	constructor ( _options ) {

		this.renderer = _options.renderer;

		// General

		this.currentLevel = null;

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

		this.end();

		// Create a new level according to the level file passed as an argument.

		switch ( _levelFile.chapter ) {

			case 'gravity':

				this.currentLevel = new GravityLevel ( { 

					renderer: this.renderer, 
					levelFile: clone ( _levelFile ),

				} );

			break;

			case 'electric':

				this.currentLevel = new ElectricLevel ( { 

					renderer: this.renderer, 
					levelFile: clone ( _levelFile ),

				} );

			break;

			case 'gravity-electric':

				this.currentLevel = new GravityElectricLevel ( { 

					renderer: this.renderer, 
					levelFile: clone ( _levelFile ),

				} );

			break;

		}

		if ( this.currentLevel ) {

			this.currentLevel.onLoad ( function () {

				if ( _onStart ) _onStart ();

			} );

		}

	}

	end () {

		if ( this.currentLevel ) {

			this.currentLevel.clearLevel ();
			delete this.currentLevel;
			this.currentLevel = null;

		}

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
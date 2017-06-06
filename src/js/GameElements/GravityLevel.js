import { LevelCore } from "./LevelCore";

export class GravityLevel extends LevelCore {

	constructor ( _options ) {

		try {

			super ( _options );
			this.build ();
			
		} catch ( e ) {

			console.error ( e );

		}
		
	}

	build () {

		super.build ();



	}

	update () {

		super.update ();

	}

	render () {

		super.render ();

	}

}
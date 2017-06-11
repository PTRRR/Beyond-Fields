import { PhysicalElement } from "./PhysicalElement";

export class Text extends PhysicalElement {

	constructor ( _options ) {

		super ( _options );

		_options = _options || {};

		this.font = _options.font || 'Helvetica';
		this.fontSize = ( _options.fontSize || 20 ) + 'px';
		this.size = _options.size || [ 512, 512 ];
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.size[ 0 ];
		this.canvas.height = this.size[ 1 ];
		this.ctx = this.canvas.getContext ( '2d' );

		this.lines = [];
		this.content = '';
		this.boundingBox = [ 0, 0 ];

		this.geometry = new THREE.PlaneGeometry ( 1, 1 );
		this.material = new THREE.MeshBasicMaterial ( { map: this.ctx } );
		this.mesh = new THREE.Mesh ( this.geometry, this.material );

		console.log(this.fontSize, this.font);

		this.ctx.fillStyle = '#030303';
		this.ctx.font = this.fontSize + ' ' + this.font;
		this.ctx.fillText ( 'sldkjllésddsadldkjhlsakjhflsakjdhflkjsadhlfkjsahlkfjhasldjhflasjdhklkjs', 0, 100 );

	}

	write ( _string ) {

		this.content += _string;


	}

	build () {



	}

}
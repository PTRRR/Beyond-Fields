export class SoundManager {

	constructor () {

		let instances = {};
		
		var audioPath = "./resources/sounds/";
        var sounds = [

            { id:"Back_sound_0", src:"Back_long_sound_0.mp3" },
            { id:"Back_sound_1", src:"Back_long_sound_1.mp3" },
            { id:"Back_sound_2", src:"Back_long_sound_2.mp3" },
            { id:"Back_sound_3", src:"Back_long_sound_3.mp3" },
            { id:"Goal_sound_0", src:"Goal_sound_0.mp3" },
            { id:"Goal_sound_1", src:"Goal_sound_1.mp3" },
            { id:"Goal_sound_2", src:"Goal_sound_2.mp3" },
            { id:"Goal_sound_3", src:"Goal_sound_3.mp3" },
            { id:"Hit_sound_0", src:"Hit_sound_0.mp3" },
            { id:"Hit_sound_1", src:"Hit_sound_1.mp3" },
            { id:"Hit_sound_2", src:"Hit_sound_2.mp3" },
            { id:"Hit_sound_3", src:"Hit_sound_3.mp3" },
            { id:"Hit_sound_4", src:"Hit_sound_4.mp3" },
            { id:"Explosion_sound_0", src:"Explosion_sound_0.mp3" },
            { id:"Explosion_sound_1", src:"Explosion_sound_1.mp3" },
            { id:"Explosion_sound_2", src:"Explosion_sound_2.mp3" },
            { id:"Gong_sound_0", src:"Gong_sound_0.mp3" },
            { id:"Gong_sound_1", src:"Gong_sound_1.mp3" },
            { id:"Gong_sound_2", src:"Gong_sound_2.mp3" },
            { id:"Gong_sound_3", src:"Gong_sound_3.mp3" },
            { id:"Triangle_sound_0", src:"Triangle_sound_0.mp3" },
            { id:"Triangle_sound_1", src:"Triangle_sound_1.mp3" },
            { id:"Player_sound_0", src:"Player_sound_0.mp3" },

        ];

		// if initializeDefaultPlugins returns false, we cannot play sound in this browser
        if (!createjs.Sound.initializeDefaultPlugins()) {return;}

        createjs.Sound.alternateExtensions = ["mp3"];
        createjs.Sound.addEventListener("fileload", handleLoad);
        createjs.Sound.registerSounds(sounds, audioPath);

        let self = this;
        let numSounds = Object.keys(sounds).length;
 
        function handleLoad(event) {
        	
        	instances[ event.id ] = event;

        	if ( Object.keys( instances ).length == numSounds ) {

        		if ( self.onLoadCallback ) self.onLoadCallback ();

        	}

        }

	}

	getInstance ( _id ) {

		return instances[ _id ];

	}

	play ( _id, _options ) {

		return createjs.Sound.play ( _id, _options || {} );

	}

	onLoad ( _callback ) {

		this.onLoadCallback = _callback;

	}

}
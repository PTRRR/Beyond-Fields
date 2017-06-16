let shaderHelper = {

	test: {

		vertex: `\

			void main () {

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );

			}

		`,

		fragment: `\

			void main () {

				gl_FragColor = vec4 ( 1.0, 0.0, 1.0, 1.0 );

			}

		`,

	},

	solidQuad: {

		vertex: `\

			void main () {

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );

			}

		`,

		fragment: `\

			uniform vec4 solidColor;

			void main () {

				gl_FragColor = solidColor;

			}

		`,

	},

	simpleTexture: {

		vertex: `\

			varying vec2 f_Uv;

			void main () {

				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );

			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			uniform sampler2D texture;

			void main () {

				gl_FragColor = texture2D ( texture, f_Uv );

			}

		`,

	},

	coloredTexture: {

		vertex: `\

			varying vec2 f_Uv;

			void main () {

				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );

			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			uniform sampler2D texture;
			uniform vec4 solidColor;

			void main () {

				gl_FragColor = texture2D ( texture, f_Uv ) * solidColor;

			}

		`,

	},

	player: {

		vertex: `\

			attribute vec4 rgbaColor;
			varying vec4 f_Color;
			varying vec2 f_Uv;

			void main () {

				f_Color = rgbaColor;
				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );

			}

		`,

		fragment: `\

			varying vec4 f_Color;
			varying vec2 f_Uv;
			uniform sampler2D texture;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				gl_FragColor = vec4 ( 0.3, 0.3, 0.3, 1.0 );
				gl_FragColor.rgb += smoothstep ( 0.0, 1.0, sdfDist ) * 0.7;

			}

		`,

	},

	playerInfo: {

		vertex: `\

			attribute vec4 rgbaColor;
			varying vec4 f_Color;
			varying vec2 f_Uv;

			void main () {

				f_Color = rgbaColor;
				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );

			}

		`,

		fragment: `\

			varying vec4 f_Color;
			varying vec2 f_Uv;
			uniform sampler2D texture;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				float t = 0.80;

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.a *= smoothstep ( 0.6, 0.50, sdfDist );


			}

		`,

	},

	playerParticles: {

		vertex: `\

			attribute vec4 transform;
			attribute vec4 rgbaColor;
			varying vec4 f_Color;
			varying vec2 f_Uv;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Color = rgbaColor;
				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );

				// Transform the position

				outPosition *= scaleMatrix ( vec3 ( transform.z ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			uniform sampler2D texture;
			varying vec4 f_Color;
			varying vec2 f_Uv;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;
				vec4 texture =  texture2D ( texture, f_Uv );
				float sdfDist = texture.r * texture.g * texture.b;

				gl_FragColor = vec4 ( 0.92, 0.92, 0.92, 1.0 );
				gl_FragColor.rgb += smoothstep ( 0.4, 1.0, sdfDist ) * 0.08;

			}

		`,

	},

	// Gravity

	blackMatter: {

		vertex: `\

			attribute vec4 transform;
			attribute vec4 rgbaColor;
			varying vec4 f_Color;
			varying vec2 f_Uv;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Color = rgbaColor;
				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );

				// Transform the position

				outPosition *= scaleMatrix ( vec3 ( transform.z ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			uniform sampler2D texture;
			varying vec4 f_Color;
			varying vec2 f_Uv;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;
				vec4 texture =  texture2D ( texture, f_Uv );
				float sdfDist = texture.r * texture.g * texture.b;

				float a = ( 1.0 - f_Color.a ) * 0.1;
				gl_FragColor = vec4 ( 0.91 + a, 0.91 + a, 0.91 + a, 1.0 );
				gl_FragColor.a = 1.0;
				gl_FragColor.rgb += smoothstep ( 0.95, 0.99, sdfDist );



				// gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist ) * smoothstep ( 2.5, 0.0, cDist );

				// gl_FragColor = vec4( f_Color.rgb * 1.5, 1.0 );
				// gl_FragColor.rgb *= 1.0 - ( smoothstep ( 0.99, 0.9, sdfDist ) * smoothstep ( 2.0, 0.0, cDist ) );
				// gl_FragColor.rgb += 1.0 - f_Color.a;

			}

		`,

	},

	blackMatterScan: {

		vertex: `\

			attribute vec4 transform;
			attribute vec4 rgbaColor;
			varying vec4 f_Color;
			varying vec2 f_Uv;
			varying float f_Scale;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Color = rgbaColor;
				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );
				f_Scale = transform.z;

				// Transform the position

				outPosition *= scaleMatrix ( vec3 ( transform.z ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			uniform sampler2D texture;
			varying vec4 f_Color;
			varying vec2 f_Uv;
			varying float f_Scale;

			void main () {

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				float w = 0.28 / ( f_Scale + 1.0 );
				float t = 0.99 - w;

				// Background

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.6 * f_Color.a );

				// Outside

				gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );

				// Outline

				gl_FragColor.rgba += smoothstep ( w, w - 0.2, abs ( t - sdfDist ) ) * f_Color.a;

			}

		`,

	},

	blackMatterInfo: {

		vertex: `\

			attribute vec4 transform;
			attribute vec4 rgbaColor;
			varying vec4 f_Color;
			varying vec2 f_Uv;
			varying float f_Scale;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Color = rgbaColor;
				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );

				// Transform the position

				f_Scale = transform.z;
				outPosition *= scaleMatrix ( vec3 ( transform.z ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			uniform sampler2D texture;
			varying vec4 f_Color;
			varying vec2 f_Uv;
			varying float f_Scale;

			void main () {

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				float w = 0.22 / ( f_Scale + 1.0 );
				float t = 0.98 - w;

				// Background

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.0 );

				// Outside

				gl_FragColor.a += smoothstep ( w, w - 0.1, abs ( t - sdfDist ) ) * f_Color.a;

			}

		`,

	},

	planet: {

		vertex: `\

			attribute vec4 rgbaColor;
			varying vec4 f_Color;
			varying vec2 f_Uv;

			void main () {

				f_Color = rgbaColor;
				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );

			}

		`,

		fragment: `\

			varying vec4 f_Color;
			varying vec2 f_Uv;
			uniform sampler2D texture;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				gl_FragColor = f_Color;
				gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist ) * smoothstep ( 3.5, 0.0, cDist );

			}

		`,

	},

	scanPlanet: {

		vertex: `\

			varying vec4 f_Color;
			varying vec2 f_Uv;
			varying float f_Scale;

			void main () {

				f_Scale = position.z;
				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );

			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			varying float f_Scale;
			uniform sampler2D texture;

			void main () {

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z * f_Scale;

				float w = 0.070;
				float t = f_Scale - w - 0.05;

				// Background

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.6 );

				// Outside

				gl_FragColor.a *= smoothstep ( f_Scale - 0.05, f_Scale - 0.08, sdfDist );

				// Outline

				gl_FragColor.rgba += smoothstep ( w, w - 0.05, abs ( t - sdfDist ) );

			}

		`,

	},

	infoPlanet: {

		vertex: `\

			attribute vec4 rgbaColor;
			varying vec4 f_Color;
			varying vec2 f_Uv;
			varying float f_Scale;

			void main () {

				f_Color = rgbaColor;
				f_Uv = uv;
				f_Scale = position.z;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );

			}

		`,

		fragment: `\

			varying vec4 f_Color;
			varying vec2 f_Uv;
			varying float f_Scale;
			uniform sampler2D texture;

			void main () {

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z * f_Scale;

				float w = 0.070;
				float t = f_Scale - w - 0.05;

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.a *= smoothstep ( w, w - 0.05, abs ( t - sdfDist ) );

			}

		`,

	},

	smoke: {

		vertex: `\

			attribute vec4 rgbaColor;
			varying vec4 f_Color;

			void main () {

				f_Color = rgbaColor;
				gl_PointSize = position.z;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );

			}

		`,

		fragment: `\

			varying vec4 f_Color;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.5 ) - gl_PointCoord.xy ) * 2.0;
				gl_FragColor = f_Color;
				gl_FragColor.a *= smoothstep ( 1.0, 0.0, cDist );
				
			}

		`,

	},

	screen: {

		vertex: `\

			void main () {

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );


			}

		`,

		fragment: `\

			uniform sampler2D texture;
			uniform vec2 screenDimentions;

			void main () {

				vec4 screenColors = texture2D ( texture, gl_FragCoord.xy / screenDimentions );
				gl_FragColor = screenColors;
					
			}

		`,

	},

	screenButton: {

		vertex: `\

			varying vec2 f_Uv;

			void main () {

				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );

			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			uniform sampler2D texture;
			uniform vec2 screenDimentions;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;

				vec4 screenColors = texture2D ( texture, gl_FragCoord.xy / screenDimentions );
				gl_FragColor = screenColors;
				gl_FragColor.a *= smoothstep ( 1.0, 0.98, cDist );

			}

		`,

	},

	testDerivative: {

		vertex: `\

			varying vec2 f_Uv;

			void main () {

				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );


			}

		`,

		fragment: `\

			varying vec2 f_Uv;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;

				gl_FragColor = vec4 ( 1.0, 1.0, 1.0, 1.0 );


				float val = abs ( fract ( ( 1.0 - cDist ) * 20.0 ) - 0.5 ) * 2.0;


				float f = fwidth ( val );

				gl_FragColor.rgb *= smoothstep ( 0.99 * f * 1.5, 0.85 * f * 1.5, val );


				// gl_FragColor = vec4 ( f_Uv.x, f_Uv.y, 0.0, 1.0 );
					
			}

		`,

	},

	// Electric

	electricCharge: {

		vertex: `\

			attribute vec4 transform;
			attribute vec4 rgbaColor;
			varying vec4 f_Color;
			varying vec2 f_Uv;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Color = rgbaColor;
				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );

				// Transform the position

				float s = abs ( transform.z );
				outPosition *= scaleMatrix ( vec3 ( s ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			uniform sampler2D texture;
			varying vec4 f_Color;
			varying vec2 f_Uv;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;
				vec4 texture =  texture2D ( texture, f_Uv );
				float sdfDist = texture.r * texture.g * texture.b;

				float alphaVal = 1.0 - ( smoothstep ( 0.99, 0.9, sdfDist ) * smoothstep ( 4.0, 0.0, cDist ) ) * abs ( f_Color.a );

				gl_FragColor = abs ( f_Color );
				gl_FragColor.a = 1.0;

				gl_FragColor.r += alphaVal * ( 1.0 - gl_FragColor.r );
				gl_FragColor.g += alphaVal * ( 1.0 - gl_FragColor.g );
				gl_FragColor.b += alphaVal * ( 1.0 - gl_FragColor.b );

				// gl_FragColor.rgb += alphaVal;

			}

		`,

	},

	electricChargeScan: {

		vertex: `\

			attribute vec4 transform;
			varying vec2 f_Uv;
			varying float f_Scale;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );

				// Transform the position

				f_Scale = transform.z;
				outPosition *= scaleMatrix ( vec3 ( transform.z ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			uniform sampler2D texture;
			varying vec2 f_Uv;
			varying float f_Scale;

			void main () {

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				float w = 0.18 / ( f_Scale + 1.0 );
				float t = 0.99 - w;

				// Background

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.6 );

				// Outside

				gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );

				// Outline

				gl_FragColor.rgba += smoothstep ( w, w - 0.1, abs ( t - sdfDist ) );

			}

		`,

	},

	electricChargeInfo: {

		vertex: `\

			attribute vec4 rgbaColor;
			attribute vec4 transform;
			varying vec2 f_Uv;
			varying float f_Scale;
			varying vec4 f_Color;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Color = rgbaColor;
				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );

				// Transform the position

				f_Scale = abs ( transform.z );
				outPosition *= scaleMatrix ( vec3 ( transform.z ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			uniform sampler2D texture;
			varying vec2 f_Uv;
			varying float f_Scale;
			varying vec4 f_Color;

			void main () {

				float xDist = abs ( 0.5 - f_Uv.x ) * 2.0 * f_Scale;
				float yDist = abs ( 0.5 - f_Uv.y ) * 2.0 * f_Scale;
				float cDist = length ( vec2 ( 0.5 ) - f_Uv ) * 2.0 * f_Scale;
				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				float w = 0.92 / ( (f_Scale + 1.0) * 5.0 );
				float t = 0.99 - w;

				// Background

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.0 );

				// Draw sign.

				if ( abs ( f_Color.r - 0.8 ) > 0.1 ) {

					// Draw cross

					float r = 0.10;
					float w1 = 0.013;

					if ( f_Color.r > f_Color.b ) {

						gl_FragColor.a += smoothstep ( w1, w1 - 0.005, yDist ) + smoothstep ( w1, w1 - 0.005, xDist );

					} else if ( f_Color.r < f_Color.b ) {

						gl_FragColor.a += smoothstep ( w1, w1 - 0.005, yDist );

					}

					gl_FragColor.a *= smoothstep ( r, r - 0.03, cDist );
					
				} else {

					gl_FragColor.a = 0.0;

				}

				// Outside

				gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );

				// Outline

				gl_FragColor.a += smoothstep ( w, w - 0.1, abs ( t - sdfDist ) );

			}

		`,

	},

	equipotentialLines: {

		vertex: `\

			const float MAX_Z = 2.0;
			const int MAX_CHARGES = 20;
			uniform float numCharges;
			uniform vec3 charges[ MAX_CHARGES ];

			varying vec2 f_Uv;
			varying float f_maxZ;
			varying float f_Z;

			void main () {

				vec4 vPos = modelViewMatrix * vec4 ( position.xyz, 1.0 );
				vec3 rV = vec3 ( 0.0 );

				for ( int i = 0; i < MAX_CHARGES; i ++ ) {

					if ( i >= int ( numCharges ) ) break;

					vec2 dir = charges[ i ].xy - vPos.xy;
					float maxDist = 5.5;
					float dist = length ( dir );

					vec3 exDir = vec3 ( charges[ i ].xy, 0.0 ) - cameraPosition;
					exDir = normalize ( exDir );
					exDir *= normalMatrix;
					exDir *= MAX_Z * ( 1.0 - clamp ( dist / maxDist, 0.0, 1.0 ) ) * ( 1.0 / pow ( dist + 1.0, 3.0 ) ) * charges[ i ].z;

					rV += exDir;

				}

				f_Uv = uv;
				f_maxZ = MAX_Z;

				vec4 outPosition = projectionMatrix * modelViewMatrix * vec4 ( position.xyz + rV, 1.0 );
				f_Z = rV.z;
				gl_Position = outPosition;

			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			varying float f_maxZ;
			varying float f_Z;

			void main()
			{

				float cDist = length ( vec2 ( 0.5 ) - f_Uv ) * 2.0;
				vec3 P = vec3 ( f_Z );

				float gsize = 50.0;
				float gwidth = 1.5;

				vec3 f  = abs( fract ( P * gsize ) -0.5 );
				vec3 df = fwidth ( P * gsize );
				vec3 g = smoothstep ( -gwidth * df, gwidth * df, f );
				float c = g.x * g.y * g.z; 
				gl_FragColor = vec4 ( 1.0, 1.0, 1.0, 1.0 - c );// * gl_Color;
				gl_FragColor.a *= 1.0 - cDist * 0.6;
				gl_FragColor.a *= pow ( clamp ( 1.0 / ( abs ( f_Z ) * 5.0 ), 0.0, 1.0 ), 2.0 );
				// gl_FragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );

			}

		`,

	},

	obstacle: {

		vertex: `\

			attribute vec4 transform;
			varying vec2 f_Uv;
			varying vec2 f_Scale;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );

				// Transform the position

				f_Scale = vec2 ( transform.z, position.z );
				outPosition *= scaleMatrix ( vec3 ( transform.z, position.z, 1.0 ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			varying vec2 f_Scale;

			void main () {

				float cDist = length ( vec2 ( 0.5 ) - f_Uv );

				gl_FragColor = vec4 ( 0.8, 0.8, 0.8, 1.0 - cDist * 0.2 );

			}

		`,

	},

	obstacleScan: {

		vertex: `\

			attribute vec4 transform;
			varying vec2 f_Uv;
			varying vec2 f_Scale;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );

				// Transform the position

				f_Scale = vec2 ( transform.z, position.z );
				outPosition *= scaleMatrix ( vec3 ( transform.z, position.z, 1.0 ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			varying vec2 f_Scale;

			void main () {

				// float w = 0.18 / ( f_Scale + 1.0 );
				// float t = 0.99 - w;

				float x = abs ( f_Uv.x - 0.5 ) * 2.0 * f_Scale.x;
				float y = abs ( f_Uv.y - 0.5 ) * 2.0 * f_Scale.y;

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.7 );

				gl_FragColor.rgba += smoothstep ( f_Scale.x - 0.015, f_Scale.x - 0.000, x ) + smoothstep ( f_Scale.y - 0.015, f_Scale.y - 0.000, y );

			}

		`,

	},

	obstacleInfo: {

		vertex: `\

			attribute vec4 transform;
			varying vec2 f_Uv;
			varying vec2 f_Scale;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );

				// Transform the position

				f_Scale = vec2 ( transform.z, position.z );
				outPosition *= scaleMatrix ( vec3 ( transform.z, position.z, 1.0 ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			varying vec2 f_Scale;

			void main () {

				// float w = 0.18 / ( f_Scale + 1.0 );
				// float t = 0.99 - w;

				float x = abs ( f_Uv.x - 0.5 ) * 2.0 * f_Scale.x;
				float y = abs ( f_Uv.y - 0.5 ) * 2.0 * f_Scale.y;

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.0 );

				gl_FragColor.a += smoothstep ( f_Scale.x - 0.020, f_Scale.x - 0.01, x ) + smoothstep ( f_Scale.y - 0.020, f_Scale.y - 0.01, y );

			}

		`,

	},

	// Gravity Electric

	electricPlanet: {

		vertex: `\

			attribute vec4 rgbaColor;
			varying vec4 f_Color;
			varying vec2 f_Uv;

			void main () {

				f_Color = rgbaColor;
				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xy, 0.0, 1.0 );

			}

		`,

		fragment: `\

			varying vec4 f_Color;
			varying vec2 f_Uv;
			uniform sampler2D texture;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				gl_FragColor = f_Color;
				gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist ) * smoothstep ( 2.5, 0.0, cDist );
				gl_FragColor.a *= smoothstep ( -0.5, 2.0, cDist );

			}

		`,

	},

	electricParticlePlanetScan: {

		vertex: `\

			attribute vec4 transform;
			varying vec2 f_Uv;
			varying float f_Scale;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );

				// Transform the position

				f_Scale = abs ( transform.z );
				outPosition *= scaleMatrix ( vec3 ( abs ( transform.z ) ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			uniform sampler2D texture;
			varying vec2 f_Uv;
			varying float f_Scale;

			void main () {

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				float w = 0.3 / ( f_Scale + 1.0 );
				float t = 0.99 - w;

				// Background

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.6 );

				// Outside

				gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );

				// Outline

				gl_FragColor.rgba += smoothstep ( w, w - 0.1, abs ( t - sdfDist ) );

			}

		`,

	},

	electricParticlePlanetInfo: {

		vertex: `\

			attribute vec4 rgbaColor;
			attribute vec4 transform;
			varying vec2 f_Uv;
			varying float f_Scale;
			varying float f_Sign;
			varying float f_Zero;
			varying vec4 f_Color;

			mat4 scaleMatrix ( vec3 scale ) {

				return mat4(scale.x, 0.0, 0.0, 0.0,
				            0.0, scale.y, 0.0, 0.0,
				            0.0, 0.0, scale.z, 0.0,
				            0.0, 0.0, 0.0, 1.0);

			}

			mat4 rotationMatrix(vec3 axis, float angle) {

				axis = normalize(axis);
				float s = sin(angle);
				float c = cos(angle);
				float oc = 1.0 - c;
				    
				return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
				            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
				            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
				            0.0,                                0.0,                                0.0,                                1.0);
				
			}

			void main () {

				f_Uv = uv;
				vec4 outPosition = vec4 ( position.xy, 0.0, 1.0 );

				// Transform the position

				f_Color = rgbaColor;
				f_Scale = abs ( transform.z );
				f_Sign = sign ( transform.z );

				if ( sign ( rgbaColor.a ) >= 0.0 ) f_Zero = 1.0;
				else f_Zero = 0.0;

				outPosition *= scaleMatrix ( vec3 ( abs ( transform.z ) ) );
				outPosition *= rotationMatrix ( vec3(0, 0, 1), transform.w );
				

				outPosition.x += transform.x;
				outPosition.y += transform.y;

				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( outPosition.xyz, 1.0 );

			}

		`,

		fragment: `\

			uniform sampler2D texture;
			varying vec2 f_Uv;
			varying float f_Scale;
			varying float f_Sign;
			varying float f_Zero;
			varying vec4 f_Color;

			void main () {

				float xDist = abs ( 0.5 - f_Uv.x ) * 2.0 * f_Scale;
				float yDist = abs ( 0.5 - f_Uv.y ) * 2.0 * f_Scale;
				float cDist = length ( vec2 ( 0.5 ) - f_Uv ) * 2.0 * f_Scale;
				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				float w = 1.6 / ( (f_Scale + 1.0) * 5.0 );
				float t = 0.99 - w;

				// Background

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.0 );

				// Draw sign.

				if ( abs ( f_Color.r - 0.8 ) > 0.1 ) {

					// Draw cross

					float r = 0.08;
					float w1 = 0.013;

					if ( f_Color.r > f_Color.b ) {

						gl_FragColor.a += smoothstep ( w1, w1 - 0.005, yDist ) + smoothstep ( w1, w1 - 0.005, xDist );

					} else if ( f_Color.r < f_Color.b ) {

						gl_FragColor.a += smoothstep ( w1, w1 - 0.005, yDist );

					}

					gl_FragColor.a *= smoothstep ( r, r - 0.03, cDist );
					
				} else {

					gl_FragColor.a = 0.0;

				}

				// Outside

				gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist );

				// Outline

				gl_FragColor.a += smoothstep ( w, w - 0.1, abs ( t - sdfDist ) );

			}

		`,

	},

	// General

	grid: {

		vertex: `\

			const float MAX_Z = 40.0;
			const int MAX_MASSES = 108;
			uniform float numMasses;
			uniform vec3 masses[ MAX_MASSES ];

			varying vec2 f_Uv;
			varying float f_maxZ;
			varying float f_Z;

			void main () {

				vec4 vPos = modelViewMatrix * vec4 ( position.xyz, 1.0 );
				vec3 rV = vec3 ( 0.0 );

				for ( int i = 0; i < MAX_MASSES; i ++ ) {

					if ( i >= int ( numMasses ) ) break;

					vec2 dir = masses[ i ].xy - vPos.xy;
					float maxDist = 5.5;
					float dist = length ( dir );

					vec3 exDir = vec3 ( masses[ i ].xy, 0.0 ) - cameraPosition;
					exDir = normalize ( exDir );
					exDir *= normalMatrix;
					exDir *= MAX_Z * ( 1.0 - clamp ( dist / maxDist, 0.0, 1.0 ) ) * ( 1.0 / pow ( dist + 1.0, 3.0 ) ) * pow ( masses[ i ].z, 2.0 );

					rV += exDir;

				}

				f_Uv = uv;
				f_maxZ = MAX_Z;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xyz + rV, 1.0 );
				f_Z = gl_Position.z;

			}

		`,

		fragment: `\

			uniform float gridSubdivisions;
			uniform float mainAlpha;

			varying vec2 f_Uv;
			varying float f_maxZ;
			varying float f_Z;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;

				// Pick a coordinate to visualize in a grid
				vec2 coord = f_Uv * gridSubdivisions;

				// Compute anti-aliased world-space grid lines
				vec2 grid = abs ( fract ( coord - 0.5 ) - 0.5 ) / fwidth ( coord );
				float line = min ( grid.x, grid.y );

				// Just visualize the grid lines directly
				gl_FragColor = vec4  ( 1.0, 1.0, 1.0, ( 1.5 - min ( line, 10.0 ) ) * 0.6 );
				gl_FragColor.a *= clamp ( ( 1.0 - cDist * 0.70 ) * pow ( clamp ( 1.0 - f_Z / ( f_maxZ + 30.0 ), 0.0, 1.0 ), 2.0 ), 0.0, 1.0 ) * mainAlpha;
				
			}

		`,
	},

	indicator: {

		vertex: `\

			varying vec2 f_Uv;

			void main () {

				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );


			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			uniform float alpha;

			void main () {

				float dX = abs ( 0.5 - f_Uv.x ) * 2.0;
				float w = 0.05;

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.a *= smoothstep ( w, w - 0.02, dX ) * alpha;

					
			}

		`,
	},

	arrival: {

		vertex: `\

			varying vec2 f_Uv;

			void main () {

				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );


			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			uniform float alpha;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.0 ) - f_Uv ) * 2.0;

				float w = 0.2;
				float t = 1.0 - w;

				gl_FragColor = vec4 ( 0.9, 0.9, 0.9, smoothstep ( 0.79, 0.8, cDist ) );


					
			}

		`,
	},

	departure: {

		vertex: `\

			varying vec2 f_Uv;

			void main () {

				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );


			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			uniform float alpha;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.6 ) - f_Uv ) * 2.0;
				// vec2 d =  vec2 ( 0.5, 0.5 ) - f_Uv) * 2.0;

				float w = 0.2;
				float t = 1.0 - w;

				gl_FragColor = vec4 ( 0.9, 0.9, 0.9, 0.0 );
				gl_FragColor.a += smoothstep ( 0.2, 0.19, abs ( ( 0.5 - f_Uv.y ) * 2.0 ) );
				gl_FragColor.a += smoothstep ( 0.8, 0.79, cDist );
					
			}

		`,
	},

	sdfFont: {

		vertex: `\

			varying vec2 f_Uv;

			void main () {

				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position.xyz, 1.0 );

			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			uniform sampler2D texture;

			void main () {

				// Just visualize the grid lines directly
				gl_FragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );
				// gl_FragColor = vec4 ( 1.0, 0.0, 0.0, 1.0 );
				gl_FragColor.a *= texture2D ( texture, f_Uv ).a;
					
			}

		`,
	},

	line: {

		vertex: `\

			uniform float thickness;
	        attribute float lineMiter;
	        attribute vec2 lineNormal;
	        attribute float lineOpacity;
	        varying float f_Edge;
	        varying float f_Thickness;
	        varying float f_Opacity;

	        void main() {

	        	f_Opacity = lineOpacity;
	        	f_Thickness = thickness;
	        	f_Edge = sign ( lineMiter );
	        	vec3 pointPos = position.xyz + vec3 ( lineNormal * thickness / 2.0 * lineMiter, 0.0 );
	        	gl_Position = projectionMatrix * modelViewMatrix * vec4 ( pointPos, 1.0 );

	        }

		`,

		fragment: `\

			uniform vec3 diffuse;
	        varying float f_Edge;
	        varying float f_Thickness;
	        varying float f_Opacity;

	        void main() {

	        	gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 0.0 );
	        	gl_FragColor.a += ( 1.0 - smoothstep ( 0.0, 0.3, abs ( f_Edge ) ) ) * f_Opacity;
	        	gl_FragColor.a *= smoothstep ( 1.0, 0.8, abs ( f_Edge ) );
	        
	        }

		`,

	}

}

export { shaderHelper };
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

				gl_FragColor = f_Color;
				gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist ) * smoothstep ( 2.5, 0.0, cDist );

				// gl_FragColor = vec4( f_Color.rgb * 1.5, 1.0 );
				// gl_FragColor.rgb *= 1.0 - ( smoothstep ( 0.99, 0.9, sdfDist ) * smoothstep ( 2.0, 0.0, cDist ) );
				// gl_FragColor.rgb += 1.0 - f_Color.a;

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

				float w = 0.15;
				float t = 0.35;

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.a *= smoothstep ( w, w - 0.1, abs ( sdfDist - t ) );


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

	planet: {

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

				gl_FragColor = f_Color;
				gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist ) * smoothstep ( 3.5, 0.0, cDist );

			}

		`,

	},

	scanPlanet: {

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

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				float w = 0.05;
				float t = 0.94;

				gl_FragColor = vec4 ( 1.0, 1.0, 1.0, 1.0 );
				gl_FragColor.a *= smoothstep ( w, w - 0.05, abs ( t - sdfDist ) );

			}

		`,

	},

	infoPlanet: {

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

				vec4 sdf = texture2D ( texture, f_Uv );
				float sdfDist = sdf.x * sdf.y * sdf.z;

				float w = 0.05;
				float t = 0.94;

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

				float alphaVal = 1.0 - ( smoothstep ( 0.99, 0.9, sdfDist ) * smoothstep ( 4.0, 0.0, cDist ) ) * f_Color.a;

				gl_FragColor = f_Color;
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

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;
				vec4 texture =  texture2D ( texture, f_Uv );
				float sdfDist = texture.r * texture.g * texture.b;

				float w = 0.04 / f_Scale;
				float t = 0.99 - w;
				float maxTargetCenter = 0.02 / f_Scale;

				gl_FragColor = vec4 ( 1.0, 1.0, 1.0, 1.0 );
				gl_FragColor.a *= smoothstep ( w, w - 0.2, abs ( sdfDist - t ) );

			}

		`,

	},

	electricChargeInfo: {

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

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 2.0;
				vec4 texture =  texture2D ( texture, f_Uv );
				float sdfDist = texture.r * texture.g * texture.b;

				float w = 0.043 / f_Scale;
				float t = 0.99 - w;
				float maxTargetCenter = 0.02 / f_Scale;

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.a *= smoothstep ( w, w - 0.2, abs ( sdfDist - t ) );
				gl_FragColor.a += smoothstep ( maxTargetCenter, maxTargetCenter - 0.05, cDist );

			}

		`,

	},

	electricPlanet: {

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

				gl_FragColor = f_Color;
				gl_FragColor.a *= smoothstep ( 0.99, 0.95, sdfDist ) * smoothstep ( 2.5, 0.0, cDist );
				gl_FragColor.a *= smoothstep ( -0.5, 2.0, cDist );

			}

		`,

	},

	equipotentialLines: {

		vertex: `\

			varying vec2 f_Uv;

			void main () {

				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );


			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			const int MAX_CHARGES = 20;
			uniform float numCharges;
			uniform vec3 charges [ MAX_CHARGES ];
			uniform vec2 screenDimentions;

			void main () {

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 1.0 );
				float strength = 0.0;

				for ( int i = 0; i < MAX_CHARGES; i ++ ) {

					if ( i >= int ( numCharges ) ) break;

					vec2 cPos = vec2 ( charges[ i ].x, screenDimentions.y - charges[ i ].y );
					float dist = length ( cPos - gl_FragCoord.xy ) * 0.001;
					strength += charges[ i ].z / ( dist * dist );

				}

				// float f = abs ( fract ( strength ) - 0.5 );

				gl_FragColor = vec4 ( 0.0, 0.0, 0.0, 1.0 );

				float cDist = length ( vec2 ( 0.5, 0.5 ) - f_Uv ) * 1.2;

				float P = strength;
				float gsize = 150.5;
				float gwidth = 3.0;
				float f  = abs(fract (P * gsize)-0.5);

				float df = fwidth(P * gsize);
				float g = smoothstep(-gwidth*df,gwidth*df , f);
				float c = g; 
				gl_FragColor = vec4( ( 1.0 - c ) * ( 1.0 - cDist ), ( 1.0 - c ) * ( 1.0 - cDist ), ( 1.0 - c ) * ( 1.0 - cDist ), 1.0 );// * gl_Color;
				gl_FragColor.a *= 1.1 - abs ( P ) * 4.0;
					
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

	grid: {

		vertex: `\

			const int MAX_MASSES = 500;
			varying vec2 f_Uv;
			uniform float numMasses;
			uniform vec3 masses [ MAX_MASSES ];

			void main () {

				f_Uv = uv;

				vec4 vPos = projectionMatrix * modelViewMatrix * vec4 ( position.xyz, 1.0 );
				vec4 rf = vec4 ( 0.0 );

				if ( numMasses > 0.0 ) {

					for ( int i = 0; i < MAX_MASSES; i ++ ) {

						if ( i >= int ( numMasses ) ) break;

						float m = masses[ i ].z;
						vec3 p = vec3 ( masses[ i ].xy, 0.0 );

						float maxDist = 4.0;
						vec3 dir = ( p - vPos.xyz );
						float dist = length ( dir );
						dist = clamp ( dist, 0.0, maxDist );


						rf.x += dir.x / ( dist * dist );

					}

				}

				// vec3 vPos = ( vec4 ( position.xyz, 1.0 ) * modelViewMatrix ).xyz;
				gl_Position = vPos + rf;


			}

		`,

		fragment: `\

			varying vec2 f_Uv;
			uniform float gridSubdivisions;

			void main () {

				float cDist = length ( vec2 ( 0.5, 0.0 ) - f_Uv ) * 2.0;

				// Pick a coordinate to visualize in a grid
				vec2 coord = f_Uv * gridSubdivisions;

				// Compute anti-aliased world-space grid lines
				vec2 grid = abs ( fract ( coord - 0.5 ) - 0.5 ) / fwidth ( coord );
				float line = min ( grid.x, grid.y );

				// Just visualize the grid lines directly
				gl_FragColor = vec4  ( 1.0, 1.0, 1.0, ( 1.0 - min ( line, 1.0 ) ) * 0.6 );

					
			}

		`,
	},

}

export { shaderHelper };
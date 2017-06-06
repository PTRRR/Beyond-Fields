let shaderHelper = {

	test: {

		vertex: `\

			varying vec2 f_Uv;

			void main () {

				f_Uv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4 ( position, 1.0 );

			}

		`,

		fragment: `\

			uniform sampler2D texture;
			varying vec2 f_Uv;

			void main () {

				gl_FragColor = texture2D ( texture, f_Uv );

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

	player: {

		vertex: `\

			void main () {



			}

		`,

		fragment: `\

			void main () {



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

				gl_FragColor = texture2D ( texture, f_Uv ) * f_Color;

			}

		`,

	},

	smoke: {

		vertex: `\

			void main () {



			}

		`,

		fragment: `\

			void main () {

				
				
			}

		`,

	},

}

export { shaderHelper };
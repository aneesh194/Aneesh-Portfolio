/* eslint-disable react/no-unknown-property */
import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const hexToNormalizedRGB = hex => {
    hex = hex.replace('#', '');
    return [
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255
    ];
};

const vertexShader = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
in vec2 vUv;
uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;
out vec4 fragColor;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  fragColor = vec4(col.rgb, 1.0);
}
`;

const Silk = ({ speed = 0.5, scale = 1, color = '#1a1a1a', noiseIntensity = 1.5, rotation = 0 }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        let renderer, gl, canvas;
        try {
            renderer = new Renderer({
                webgl: 2,
                alpha: true,
                antialias: true,
                dpr: Math.min(window.devicePixelRatio || 1, 2)
            });
            gl = renderer.gl;
            if (!gl) throw new Error("WebGL context not created");
            canvas = gl.canvas;
        } catch (error) {
            console.error("WebGL limit reached or unsupported in Silk:", error);
            return;
        }
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        containerRef.current.appendChild(canvas);

        const geometry = new Triangle(gl);
        const colorRgb = hexToNormalizedRGB(color);

        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new Float32Array(colorRgb) },
                uSpeed: { value: speed },
                uScale: { value: scale },
                uRotation: { value: rotation },
                uNoiseIntensity: { value: noiseIntensity }
            }
        });

        const mesh = new Mesh(gl, { geometry, program });

        const setSize = () => {
            const rect = containerRef.current.getBoundingClientRect();
            renderer.setSize(rect.width, rect.height);
        };

        const ro = new ResizeObserver(setSize);
        ro.observe(containerRef.current);
        setSize();

        let raf = 0;
        const loop = t => {
            program.uniforms.uTime.value = t * 0.001;
            renderer.render({ scene: mesh });
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            if (containerRef.current && canvas.parentNode === containerRef.current) {
                containerRef.current.removeChild(canvas);
            }
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, [color, speed, scale, rotation, noiseIntensity]);

    return <div ref={containerRef} className="w-full h-full" />;
};

export default Silk;

// vertex shader
var vs = 
    `uniform mat4 u_worldViewProjection;

    attribute vec4 position;
    attribute vec2 texcoord;
    attribute vec3 normal;

    varying vec4 v_pos;
    varying vec2 v_texCoord;
    
    void main() {
        v_pos = u_worldViewProjection * position;
        v_texCoord = texcoord;
        gl_Position = v_pos;
    }`
;

// fragment shader
var fs = 
    `precision mediump float;

    varying vec2 v_texCoord;

    uniform sampler2D texture;

    void main() {
        gl_FragColor = texture2D(texture, v_texCoord);
    }`
;

// variaveis gerais
const m4 = twgl.m4;
const gl = document.querySelector("canvas").getContext("webgl");
const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
const canvas = document.querySelector("canvas");

// definir planetas
const sun = twgl.primitives.createSphereBufferInfo(gl, 0.6, 100, 100);
const mercury = twgl.primitives.createSphereBufferInfo(gl, 0.1, 100, 100);
const venus = twgl.primitives.createSphereBufferInfo(gl, 0.14, 100, 100);
const earth = twgl.primitives.createSphereBufferInfo(gl, 0.2, 100, 100);
const moon = twgl.primitives.createSphereBufferInfo(gl, 0.08, 100, 100);
const mars = twgl.primitives.createSphereBufferInfo(gl, 0.18, 100, 100);
const jupiter = twgl.primitives.createSphereBufferInfo(gl, 0.25, 100, 100);
const saturn = twgl.primitives.createSphereBufferInfo(gl, 0.22, 100, 100);
const saturnRing = twgl.primitives.createDiscBufferInfo(gl, 0.45, 100, 3, 0.3);
const uranus = twgl.primitives.createSphereBufferInfo(gl, 0.16, 100, 100);
const uranusRing = twgl.primitives.createDiscBufferInfo(gl, 0.25, 100, 3, 0.3);
const neptune = twgl.primitives.createSphereBufferInfo(gl, 0.18, 100, 100);
const pluto = twgl.primitives.createSphereBufferInfo(gl, 0.08, 100, 100);
const planets = [sun,mercury,venus,earth,moon,mars,jupiter,saturn,saturnRing,uranus,uranusRing,neptune,pluto]

// carregar texturas
const texSun = twgl.createTexture(gl, { src: '/texturas/sun.jpg' });
const texMercury = twgl.createTexture(gl, { src: '/texturas/mercury.jpg' });
const texVenus = twgl.createTexture(gl, { src: '/texturas/venus.jpg' });
const texEarth = twgl.createTexture(gl, { src: '/texturas/earth.jpg' });
const texMoon = twgl.createTexture(gl, { src: '/texturas/moon.jpg' });
const texMars = twgl.createTexture(gl, { src: '/texturas/mars.jpg' });
const texJupiter = twgl.createTexture(gl, { src: '/texturas/jupiter.jpg' });
const texSaturn = twgl.createTexture(gl, { src: '/texturas/saturn.jpg' });
const texSaturnRing = twgl.createTexture(gl, { src: '/texturas/saturnring.jpg' });
const texUranus = twgl.createTexture(gl, { src: '/texturas/uranus.jpg' });
const texUranusRing = twgl.createTexture(gl, { src: '/texturas/uranusring.jpg' });
const texNeptune = twgl.createTexture(gl, { src: '/texturas/neptune.jpg' });
const texPluto = twgl.createTexture(gl, { src: '/texturas/pluto.jpg' });
const textures = [texSun,texMercury,texVenus,texEarth,texMoon,texMars,texJupiter,texSaturn,texSaturnRing,texUranus,texUranusRing,texNeptune,texPluto];

const texSpace = twgl.createTexture(gl, { target: gl.TEXTURE_CUBE_MAP, src: '/texturas/stars.jpg' }); // textura da skybox

var uniforms = {};

// preparar camara default
var eye = [0, 0, -10, 0];
var target = [0, 0, 0, 0];
const up = [0, 1, 0, 0];

// preparar projecao default
const zNear = 0.5;
const zFar = 1000;
var fov = 30 * Math.PI / 180;

function render(time) {
    // ajustar janela e projecao dinamicamente
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const camera = m4.lookAt(eye, target, up);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fov, aspect, zNear, zFar);
    const view = m4.inverse(camera);
    const viewProjection = m4.multiply(projection, view);
    
    // ajustar viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(programInfo.program);

    // background
    gl.clearColor(0, 0, 0, 1); // colocar fundo preto
    /*uniforms.u_skybox = texSpace;
    uniforms.u_viewDirectionProjectionInverse = m4.identity;
    const plane = twgl.primitives.createXYQuadBufferInfo(gl);
    twgl.setBuffersAndAttributes(gl, programInfo, plane);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, plane);*/

    // transformacoes a aplicar a cada planeta
    const sunTranform = m4.multiply(m4.translation([0,0,0]),m4.rotationZ(time*0.0002));

    var mercuryTansform = m4.multiply(m4.translation([-1,0,0]),m4.rotationZ(time*0.0002));
    mercuryTansform = m4.multiply(m4.rotationZ(time*0.001),mercuryTansform);

    var venusTransform = m4.multiply(m4.translation([-2,0,0]),m4.rotationZ(time*0.0002));
    venusTransform = m4.multiply(m4.rotationZ(time*0.0005),venusTransform);

    var earthTransform = m4.multiply(m4.translation([-3,0,0]),m4.rotationZ(time*0.0003));
    earthTransform = m4.multiply(m4.rotationZ(time*0.0003),earthTransform);

    var moonTransform = m4.multiply(m4.rotationY(time*0.001),m4.translation([-0.4,0,0]));
    moonTransform = m4.multiply(earthTransform, moonTransform);

    var marsTransform = m4.multiply(m4.translation([-4,0,0]),m4.rotationZ(time*0.0003));
    marsTransform = m4.multiply(m4.rotationZ(time*0.0001),marsTransform);

    var jupiterTransform = m4.multiply(m4.translation([-5,0,0]),m4.rotationZ(time*0.0003));
    jupiterTransform = m4.multiply(m4.rotationZ(time*0.0002),jupiterTransform);

    var saturnTransform = m4.multiply(m4.translation([-6,0,0]),m4.rotationZ(time*0.0003));
    saturnTransform = m4.multiply(m4.rotationZ(time*0.00015),saturnTransform);

    var uranusTransform = m4.multiply(m4.translation([-7,0,0]),m4.rotationZ(time*0.0004));
    uranusTransform = m4.multiply(m4.rotationZ(time*0.00013),uranusTransform);

    var neptuneTransform = m4.multiply(m4.translation([-8,0,0]),m4.rotationZ(time*0.0003));
    neptuneTransform = m4.multiply(m4.rotationZ(time*0.0001),neptuneTransform);

    var plutoTransform = m4.multiply(m4.translation([-9,0,0]),m4.rotationZ(time*0.0003));
    plutoTransform = m4.multiply(m4.rotationZ(time*0.00008),plutoTransform);

    const tranformations = [sunTranform,mercuryTansform,venusTransform,earthTransform,moonTransform,marsTransform,
        jupiterTransform,saturnTransform,saturnTransform,uranusTransform,uranusTransform,neptuneTransform,plutoTransform];


    // renderizar planetas
    for (var i = 0; i < planets.length; i++) {
        uniforms.u_viewDirectionProjectionInverse = null;
        uniforms.u_worldViewProjection = m4.multiply(viewProjection, tranformations[i]);
        uniforms.texture = textures[i];
        twgl.setBuffersAndAttributes(gl, programInfo,planets[i]);
        twgl.setUniforms(programInfo, uniforms);
        twgl.drawBufferInfo(gl, planets[i]);
    }

    requestAnimationFrame(render);
}

// adicionar funcao de zoom
canvas.addEventListener("wheel", fovController);
function fovController(event) {
    if (event.deltaY < 0 && fov > 0.05)
        fov -= 0.03;
    else if (event.deltaY > 0 && fov < 1.5)
        fov += 0.03;
} 

// ao clicar no canvas
canvas.onmousedown = function(event) {
    // registar qual o botao usado
    const button = event.button;

    // ao arrastar
    function onMouseMove(event) {
        if (button == 0) { // rodar em torno de target
            var x = m4.rotationX(degrees_to_radians(event.movementY/3));
            var rotation = m4.rotateY(x,degrees_to_radians(-event.movementX/3));
            eye[0] -= target[0];
            eye[1] -= target[1];
            eye[2] -= target[2];
            eye = m4.multiply(rotation,eye);
            eye[0] += target[0];
            eye[1] += target[1];
            eye[2] += target[2];
        } else if (button == 2) {
            target[0] += event.movementX * 0.005;
            target[1] += event.movementY * 0.005;
        }
    }
    document.addEventListener('mousemove', onMouseMove);
  
    // ao levantar botão
    canvas.onmouseup = function() {
      document.removeEventListener('mousemove', onMouseMove);
    };
  
};

function degrees_to_radians(degrees) {
  return degrees * (Math.PI/180);
}

requestAnimationFrame(render);
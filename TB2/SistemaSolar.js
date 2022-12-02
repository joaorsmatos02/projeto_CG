// vertex phong
var vsPhong = 
    `uniform mat4 u_worldViewProjection;
    uniform vec3 u_lightWorldPos;
    uniform mat4 u_world;
    uniform mat4 u_viewInverse;
    uniform mat4 u_worldInverseTranspose;
    
    attribute vec4 position;
    attribute vec3 normal;
    attribute vec2 texcoord;
    
    varying vec4 v_position;
    varying vec2 v_texCoord;
    varying vec3 v_normal;
    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    
    void main() {
      v_texCoord = texcoord;
      v_position = u_worldViewProjection * position;
      v_normal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
      
      v_surfaceToLight = u_lightWorldPos - (u_world * position).xyz;
      v_surfaceToView = (u_viewInverse[3] - (u_world * position)).xyz;
      
      gl_Position = v_position;
    }`
;

// fragment phong
var fsPhong = 
    `precision mediump float;

    varying vec4 v_position;
    varying vec2 v_texCoord;
    varying vec3 v_normal;
    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    
    uniform vec4 u_lightColor;
    uniform vec4 u_ambient;
    uniform sampler2D u_diffuse;
    uniform vec4 u_specular;
    uniform float u_shininess;
    uniform float u_specularFactor;
    
    vec4 lit(float l ,float h, float m) {
      return vec4(1.0,
                  max(l, 0.0),
                  (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
                  1.0);
    }
    
    void main() {
      vec4 diffuseColor = texture2D(u_diffuse, v_texCoord);
      vec3 a_normal = normalize(v_normal);
      vec3 surfaceToLight = normalize(v_surfaceToLight);
      vec3 surfaceToView = normalize(v_surfaceToView);
    
      vec3 halfVector = normalize(surfaceToLight + surfaceToView);
      
      vec4 litR = lit(dot(a_normal, surfaceToLight),
                        dot(a_normal, halfVector), u_shininess);
      
      vec4 outColor = vec4((
        u_lightColor * (diffuseColor * litR.y + diffuseColor * u_ambient +
                    u_specular * litR.z * u_specularFactor)).rgb,
          diffuseColor.a);
      
          gl_FragColor = outColor;
    }`
;

// vertex gouraud
var vsGouraud = `
    uniform mat4 u_worldViewProjection;
    uniform vec3 u_lightWorldPos;
    uniform mat4 u_world;
    uniform mat4 u_viewInverse;
    uniform mat4 u_worldInverseTranspose;

    uniform vec4 u_lightColor;
    uniform vec4 u_ambient;
    uniform sampler2D u_diffuse;
    uniform vec4 u_specular;
    uniform float u_shininess;
    uniform float u_specularFactor;

    attribute vec4 position;
    attribute vec3 normal;
    attribute vec2 texcoord;

    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    varying vec4 vertex_color;
    varying vec3 v_normal;
    varying vec2 v_texCoord;

    void main(){
        v_texCoord = texcoord;
        v_surfaceToView = (u_viewInverse[3] - (u_world * position)).xyz;
        v_surfaceToLight = u_lightWorldPos - (u_world * position).xyz; 
        v_normal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
        
        vec3 E = normalize(-v_surfaceToView);       // we are in Eye Coordinates, so EyePos is (0,0,0)  
        vec3 R = normalize(-reflect(v_surfaceToLight,v_normal));  
        
        //calculate Ambient Term:  
        vec4 Iamb = u_ambient;    
        
        //calculate Diffuse Term:  
        vec4 Idiff = texture2D(u_diffuse, texcoord) * max(dot(v_normal,v_surfaceToLight), 0.0);    
        
        // calculate Specular Term:
        vec4 Ispec = u_specular * pow(max(dot(R,E),0.0),0.3*u_shininess);
        
        vertex_color = u_lightColor + Iamb + Idiff + Ispec; 
        
        gl_Position = u_worldViewProjection * position;
    }`
;

// fragment gouraud
var fsGouraud = 
    `precision mediump float;
    uniform sampler2D u_diffuse;
    varying vec2 v_texCoord;
    varying vec4 vertex_color;   
  
    void main (void)  {    
      gl_FragColor = texture2D(u_diffuse, v_texCoord) * vertex_color;   
    }`
;

const phong = [vsPhong,fsPhong];
const gouraud = [vsGouraud,fsGouraud];

// variaveis gerais
const m4 = twgl.m4;
const gl = document.querySelector("canvas").getContext("webgl");
const programInfo = twgl.createProgramInfo(gl, phong);
const canvas = document.querySelector("canvas");

// definir planetas
const skybox = twgl.primitives.createSphereBufferInfo(gl, 25, 100, 100);
const sun = twgl.primitives.createSphereBufferInfo(gl, 0.6, 100, 100);
const mercury = twgl.primitives.createSphereBufferInfo(gl, 0.1, 100, 100);
const venus = twgl.primitives.createSphereBufferInfo(gl, 0.14, 100, 100);
const earth = twgl.primitives.createSphereBufferInfo(gl, 0.2, 100, 100);
const moon = twgl.primitives.createSphereBufferInfo(gl, 0.08, 100, 100);
const mars = twgl.primitives.createSphereBufferInfo(gl, 0.18, 100, 100);
const jupiter = twgl.primitives.createSphereBufferInfo(gl, 0.25, 100, 100);
const saturn = twgl.primitives.createSphereBufferInfo(gl, 0.22, 100, 100);
const saturnRing = twgl.primitives.createTorusBufferInfo(gl, 0.4, 0.08, 100, 100);
const uranus = twgl.primitives.createSphereBufferInfo(gl, 0.16, 100, 100);
const uranusRing = twgl.primitives.createTorusBufferInfo(gl, 0.25, 0.03, 100, 100);
const neptune = twgl.primitives.createSphereBufferInfo(gl, 0.18, 100, 100);
const pluto = twgl.primitives.createSphereBufferInfo(gl, 0.08, 100, 100);
const planets = [skybox,sun,mercury,venus,earth,moon,mars,jupiter,saturn,saturnRing,uranus,uranusRing,neptune,pluto]

// carregar texturas
const texSkybox = twgl.createTexture(gl, { src: '/texturas/stars.jpg' });
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
const textures = [texSkybox,texSun,texMercury,texVenus,texEarth,texMoon,texMars,texJupiter,texSaturn,texSaturnRing,texUranus,texUranusRing,texNeptune,texPluto];

// definir iluminacao
var uniforms = { 
    u_lightWorldPos: [0, 0, 0],
    u_lightColor: [0.9, 0.8, 0.8, 1],
    u_specular: [1, 1, 1, 1],
    u_shininess: 1,
    u_specularFactor: 0.2,
    u_worldInverseTranspose: m4.transpose(m4.inverse(m4.identity()))
};

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
   // gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(programInfo.program);
    gl.clearColor(0,0,0,1);

    // transformacoes a aplicar a cada planeta
    const sunTranform = m4.rotationZ(time*0.0002);

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

    const saturnRingTransform = m4.multiply(saturnTransform,m4.scaling([1,0.01,1]));

    var uranusTransform = m4.multiply(m4.translation([-7,0,0]),m4.rotationZ(time*0.0004));
    uranusTransform = m4.multiply(m4.rotationZ(time*0.00013),uranusTransform);

    const uranusRingTransform = m4.multiply(uranusTransform,m4.scaling([1,0.01,1]));

    var neptuneTransform = m4.multiply(m4.translation([-8,0,0]),m4.rotationZ(time*0.0003));
    neptuneTransform = m4.multiply(m4.rotationZ(time*0.0001),neptuneTransform);

    var plutoTransform = m4.multiply(m4.translation([-9,0,0]),m4.rotationZ(time*0.0003));
    plutoTransform = m4.multiply(m4.rotationZ(time*0.00008),plutoTransform);

    const tranformations = [m4.identity(),sunTranform,mercuryTansform,venusTransform,earthTransform,moonTransform,marsTransform,
        jupiterTransform,saturnTransform,saturnRingTransform,uranusTransform,uranusRingTransform,neptuneTransform,plutoTransform];

    // renderizar planetas
    for (var i = 0; i < planets.length; i++) {
        if (i < 2)
            uniforms.u_ambient = [1, 1, 1, 1];
        else
            uniforms.u_ambient = [0.2, 0.2, 0.2, 1];
        uniforms.u_viewInverse = camera;
        uniforms.u_world = tranformations[i];
        uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(tranformations[i]));
        uniforms.u_worldViewProjection = m4.multiply(viewProjection, tranformations[i]);
        uniforms.u_diffuse = textures[i];
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
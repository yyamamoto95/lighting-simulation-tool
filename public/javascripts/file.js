let now_targets=[], now_spotlights=[];
function add2scene(obj) {
    scene.add(obj);
    if (obj.type == 'SpotLight'){
        let newLightHelper = new THREE.SpotLightHelper( obj );
        newLightHelper.name = 'LightHelper' + LightHelpers.length;
        newLightHelper.visible = param.debug;
        scene.add(newLightHelper);

        LightHelpers.push(newLightHelper);
        add_SpotLights.push(obj);
    }else if (obj.type == 'target'){
        console.log(add_targets)
        add_targets.push(obj);
    }else{
        var search_type = scene.children.filter(function(item, index){
            return item.type == obj.type;
        });
        obj.name = obj.type + search_type.length;
    };
};

function createSpotlight( color ) {
    let newObj = new THREE.SpotLight( color, 2 );
    create_SpotLights.push(newObj);
    newObj.castShadow = true;
    newObj.angle = 0.3;
    newObj.penumbra = 0.2;
    newObj.decay = 2;
    newObj.distance = 50;

    newObj.shadow.mapSize.width = 1024;
    newObj.shadow.mapSize.height = 1024;
    newObj.position.set( -10 + 5*Number(now_spotlights.length), 15, 0.0 );
    let newtarget = Createtarget();
    add2scene(newtarget);
    newObj.target = newtarget;
    
    newObj.name = newObj.type + create_SpotLights.length;
    addGUI2light(newObj);
    
    return newObj;
    //return [newobj, newtarget];
};

function Createtarget( ) {
    let gtar = new THREE.SphereGeometry(5);//大きさ: 半径5
    let mtar =new THREE.MeshPhongMaterial({transparent: true});
    let newtarget = new THREE.Mesh(gtar,mtar);
    newtarget.position.set(-10,0,10*Math.cos(create_targets.length*5));
    newtarget.type = 'target';
    newtarget.name = 'target' + create_targets.length;
    if (param.debug) 
        {newtarget.material.opacity = 1
    }else newtarget.material.opacity = 0;
    create_targets.push(newtarget);
    return newtarget;
};

function reCreateSpotLight(  ){
    let re_SpotLight = new THREE.SpotLight( 2 );
    //console.log(LightFolder)
    //LightFolder.length=0;
    re_SpotLight.castShadow = true;
    re_SpotLight.angle = 0.3;
    re_SpotLight.penumbra = 0.2;
    re_SpotLight.decay = 2;
    re_SpotLight.distance = 50;

    re_SpotLight.shadow.mapSize.width = 1024;
    re_SpotLight.shadow.mapSize.height = 1024;

    create_SpotLights.push(re_SpotLight);
    return re_SpotLight;
};

function reCreatetarget( x,y,z ) {
    let gtar = new THREE.SphereGeometry(5);
    let mtar =new THREE.MeshPhongMaterial({transparent: true});
    let newtarget = new THREE.Mesh(gtar,mtar);
    //console.log()
    newtarget.position.set( x,y,z );
    newtarget.type = 'target';
    newtarget.name = 'target' + create_targets.length;
    if (param.debug) 
        {newtarget.material.opacity = 1
    }else newtarget.material.opacity = 0;

    create_targets.push(newtarget);
    return newtarget;
};
let cloud
function createpoint(size, transparent, opacity, vertexColors, sizeAttenuation, color) {

    var geom = new THREE.Geometry();
    var material = new THREE.PointsMaterial({
        size: (2,2,0.5),
        transparent: transparent,
        opacity: opacity,
        vertexColors: vertexColors,
        sizeAttenuation: sizeAttenuation,
        color: color
    });
    let zz = -(stage_w/2);
    for (var i = 1; i < 2*point_num+2; i++) {
        console.log((point_num+1)/(stage_w/2));
        var particle = new THREE.Vector3(-10,1.5,zz+ i*((stage_w/2)/(point_num+1)));
        geom.vertices.push(particle);
        var color = new THREE.Color(0x00ff00);
        color.setHSL(color.getHSL().h, color.getHSL().s, Math.random() * color.getHSL().l);
        geom.colors.push(color);

    }

    cloud = new THREE.Points(geom, material);
    cloud.name = "particles";
    scene.add(cloud);
}


function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

let debag; 
let point_num=false;
function render() {
    if (param.debug){
        for (x in LightHelpers){
            LightHelpers[x].update();
        }
    }
    now_targets = scene.children.filter(function(item, index){
        return item.type == 'target';
    });
    now_spotlights = scene.children.filter(function(item, index){
        return item.type == 'SpotLight';
    });
    if (param.motion) update();
    if ( param.move_SpotLight==false && param.move_StartPoint == false) select_target = 0;

    renderer.render( scene, camera );
    requestAnimationFrame( render );
};

function update() {
    let time = Date.now();
    var t = ( time / 1000 );
    var r = 12.0;

    var lx = r * Math.cos( t );
    var lz =-50 +  r * Math.sin( t );
    var lx2 = r * Math.cos( t-10 );
	var lz2 =-50 +  r * Math.sin( t-10 );

    add_targets[0].position.set( lz/5, 0, lx );
    add_targets[1].position.set( lz2/5, 0, lx2 );
    console.log(now_targets[0].position)
    }

var gui;
function buildGui() {
    gui = new dat.GUI( { width: 300 } );
    gui.open();
    param = {
        motion: false,
        debug: false,
        remove_SpotLight: false,
        move_SpotLight: false,
        move_StartPoint: false
    };

    gui.add( param, 'motion' );
    let remove_SL = gui.add( param, 'remove_SpotLight');
    let move_SL = gui.add( param, 'move_SpotLight');
    let move_Start = gui.add( param, 'move_StartPoint');
    debug =  gui.add( param, 'debug' );

    debug.onChange(function(value) {
        LightHelpers.forEach( function( item ) {
            item.visible = value;
        })
        now_targets.forEach( function( item ) {
            if (value) {item.material.opacity = 1
            }else item.material.opacity = 0;
        });
    });

    remove_SL.onChange(function(value) {
        if (value){
            param.move_SpotLight = false;
            param_move_StartPoint = false;
        }
    });
    move_Start.onChange(function(value) {
        if (value){
            param.remove_SpotLight = false;
            param.move_SpotLight = false;
        }
    });
    move_SL.onChange(function(value) {
        if (value){
            param.remove_SpotLight = false;
            param_move_StartPoint = false;
        }
    });

};

function otherGui() {
    other_gui = new dat.GUI( { width: 300 } );

    other_gui.close();
    other = {
        show_point: false,
        point3: false,
        point16: false,
        point32: false,
    };

    let show = other_gui.add( other, 'show_point');
    let p3 = other_gui.add( other, 'point3');
    let p16 = other_gui.add( other, 'point16');
    let p32 = other_gui.add( other, 'point32');

    p3.onChange(function(value) {
        if (value) {
            point_num=3;
        }else{
            point_num=value;
            other.show_point=value
    }})
    p16.onChange(function(value) {
        if (value) {
            point_num=16;
        }else{
            point_num=value;
            other.show_point=value
    }})

    p32.onChange(function(value) {
        if (value) {
            point_num=32;
        }else{
            point_num=value;
            other.show_point=value
    }})
    show.onChange(function(value) {
        boxes.visible=value;
        if (value) {
            if (point_num!=false)createpoint(5, 1, 0.5, 0, 1, 0xFFFFFF);
        }else {
            scene.remove(cloud)
        };
    });
};
const texLoader = new THREE.TextureLoader();
texture = texLoader.load("img/texture.png");
texture1 = texLoader.load("img/texture1.png");
texture2 = texLoader.load("img/texture2.jpg");
texture3 = texLoader.load("img/texture3.png");

function addlightGui() {
    addlight_gui = new dat.GUI( { width: 300 } );

    addlight_gui.open();

    var controls_add = new function () {
        this.numberOfObjects = scene.children.length;
        this.addSpotLight = function () {
            if(add.Light1){
                const newmodel1_g = new THREE.ConeGeometry( 1.0, 10, 32 );
                const newmodel1_m = new THREE.MeshBasicMaterial({
                        map: texture2,
                        color: 0xFF0000,
                        transparent: true,
                        blending: THREE.AdditiveBlending,
                        side: THREE.DoubleSide,
                        depthWrite: false
                });
                model1 = new THREE.Mesh(newmodel1_g, newmodel1_m);
                model1.type='Light1_'
                model1.position.set(10,10,0)
                add2scene(model1);
                addGUI2modellight(model1)
            }else if(add.Light2){
                const newmodel_g = new THREE.CylinderGeometry(2, 2, 15, 25, 25, true);
                const newmodel_m = new THREE.MeshBasicMaterial({
                        map: texture,           // テクスチャーを指定
                        color: 0xFF0000,        // 色
                        transparent: true,      // 透明の表示許可
                        blending: THREE.AdditiveBlending, // ブレンドモード
                        side: THREE.DoubleSide, // 表裏の表示設定
                        depthWrite: false       // デプスバッファへの書き込み可否
                });
                model = new THREE.Mesh(newmodel_g, newmodel_m);
                model.type='Light2_'
                model.position.set(0,10,0)
                
                add2scene(model);
                addGUI2modellight(model)
            }else if(add.Light3){
                console.log()
                const newmodel_g = new THREE.CylinderGeometry(3, 3, 15, 25, 25, true);
                const newmodel_m = new THREE.MeshBasicMaterial({
                        map: texture3,           // テクスチャーを指定
                        color: 0xFF0000,        // 色
                        transparent: true,      // 透明の表示許可
                        blending: THREE.AdditiveBlending, // ブレンドモード
                        side: THREE.DoubleSide, // 表裏の表示設定
                        depthWrite: false       // デプスバッファへの書き込み可否
                });
                model = new THREE.Mesh(newmodel_g, newmodel_m);
                model.type='Light3_'
                model.position.set(0,10,0)
                add2scene(model);
                addGUI2modellight(model)
            }else if (add.Light4){
                var plus_spotLight = createSpotlight( 0xFFFFFF );
                add2scene(plus_spotLight); 
            };
            this.numberOfObjects = scene.children.length;
        };
        this.outputObjects = function () {
        }
    };

    add = {
        Light1: false,
        Light2: false,
        Light3: false,
        Light4: false,
    };

    let add_SL = addlight_gui.add( controls_add, 'addSpotLight' );
    let L1 = addlight_gui.add( add, 'Light1');
    let L2 = addlight_gui.add( add, 'Light2');
    let L3 = addlight_gui.add( add, 'Light3');
    let L4 = addlight_gui.add( add, 'Light4');

    L1.onChange(function(value) {
        if(value){
            add.L2 = false;
            add.L3= false;
            add.L4 = false;
    }})
    L2.onChange(function(value) {
        if(value){
            add.L1 = false;
            add.L3= false;
            add.L4 = false;
    }})

    L3.onChange(function(value) {
        if(value){
            add.L2 = false;
            add.L1= false;
            add.L4 = false;
    }})
    L4.onChange(function(value) {
        if(value){
            add.L2 = false;
            add.L3= false;
            add.L1 = false;
    }});
};

function addGUI2light(GUI2SpotLight){
    proparty={
        color: GUI2SpotLight.color.getHex(),	
        intensity: GUI2SpotLight.intensity
    };

    LightFolder = lightgui.addFolder(GUI2SpotLight.name);

    LightFolder.addColor( proparty, 'color').onChange( function ( val ) {
            GUI2SpotLight.color.setHex( val )
    });
    LightFolder.add( proparty, 'intensity', 0.0, 5 ).onChange( function ( val ) {
            GUI2SpotLight.intensity = val;
        } );
    LightFolder.open();
};

function addGUI2modellight(GUI2modellight){
    console.log((GUI2modellight.material.color.getHex()));
    proparty={
        'color': GUI2modellight.material.color.getHex(),	
        'rotationX': GUI2modellight.rotation.x,
        'rotationZ': GUI2modellight.rotation.z,
        'positionX+': 0,
        'positionX-': 0,
        'positionY+': 0,
        'positionY-': 0,
        'positionZ+': 0,
        'positionZ-': 0
    };
    console.log(GUI2modellight.giometry)

    modellightFolder = lightgui.addFolder(GUI2modellight.name);

    modellightFolder.addColor( proparty, 'color').onChange( function ( val ) {
            GUI2modellight.material.color.setHex( val )
    });
    modellightFolder.add( proparty, 'rotationX', 0.0, 1 ).onChange( function ( val ) {
        GUI2modellight.rotation.x = val*Math.PI*2;
    });
    modellightFolder.add( proparty, 'rotationZ', 0.0, 1 ).onChange( function ( val ) {
        GUI2modellight.rotation.z = val*Math.PI*2;
    });
    modellightFolder.add( proparty, 'positionX+', 0.0, 1 ).onChange( function ( val ) {
        GUI2modellight.position.x = val+GUI2modellight.position.x;
    });
    modellightFolder.add( proparty, 'positionX-', 0.0, 1 ).onChange( function ( val ) {
        GUI2modellight.position.x = GUI2modellight.position.x-val;
    });
    modellightFolder.add( proparty, 'positionY+', 0.0, 1 ).onChange( function ( val ) {
        GUI2modellight.position.y = val+GUI2modellight.position.y;
    });
    modellightFolder.add( proparty, 'positionY-', 0.0, 1 ).onChange( function ( val ) {
        GUI2modellight.position.y = GUI2modellight.position.y-val;
    });
    modellightFolder.add( proparty, 'positionZ+', 0.0, 1 ).onChange( function ( val ) {
        GUI2modellight.position.z = val+GUI2modellight.position.z;
    });
    modellightFolder.add( proparty, 'positionZ-', 0.0, 1 ).onChange( function ( val ) {
        GUI2modellight.position.z = GUI2modellight.position.z-val;
    });

    modellightFolder.open();
};



function onDocumentMouseDown(event) {
    if (select_target != 0) select_target =0;
    var mouseX =(event.clientX / window.innerWidth ) * 2 - 1;
    var mouseY =-( event.clientY / window.innerHeight ) * 2 + 1;
    
    if (mouseX < -0.7 && mouseY > 0.5) gui.__proto__.constructor.toggleHide();
    var vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    vector = vector.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(add_targets);
    
    if (intersects.length > 0) {
        for (key in intersects){
            if (intersects[key].object.type == 'target'){
                let n = intersects[key].object.name.replace('target','');
                if (param.remove_SpotLight){
                    for (x in add_SpotLights){
                        if (add_SpotLights[x].name == 'SpotLight' + String(Number(n)+1)) {
                            scene.remove(add_SpotLights[x])
                            scene.remove(add_targets[x])
                            scene.remove(LightHelpers[x])
                        };
                    }
                }else if (param.move_SpotLight){
                    select_target = add_targets[n];
                }else if (param.move_StartPoint){
                    select_target = add_SpotLights[n];
                }
            }
        }	
    };
};

function onDocumentKeyDown(event){
    console.log(event.keyCode)
    if (select_target != 0){
        if (event.keyCode == 65){
            select_target.position.z++ ;
            //r++;
        }else if (event.keyCode == 83){
            select_target.position.z-- ;
            //r--;
        }else if (event.keyCode == 87){
            select_target.position.x-- ;
        }else if (event.keyCode == 90){
            select_target.position.x++ ;
        }else if (event.keyCode == 90){
            select_target.position.x++ 
        }else if (event.keyCode == 73){
            select_target.position.y++ ;
        }else if (event.keyCode == 75){
            select_target.position.y--
        };
    }
};


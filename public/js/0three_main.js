var renderer = new THREE.WebGLRenderer();
			renderer.setPixelRatio( window.devicePixelRatio );

      // new THREE.PerspectiveCamera(画角, アスペクト比, 描画開始距離, 描画終了距離)
			var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 2000 );

			var controls = new THREE.OrbitControls( camera);//, renderer.domElement );

			var scene = new THREE.Scene();

      //フロア、ステージ設定
      //メインステージ
			//var matFloor = new THREE.MeshPhongMaterial({transparent: false}); **どちらか
			var matFloor = new THREE.MeshPhongMaterial({color: 0x808080, transparent: false});//**どちらか
			var matBox = new THREE.MeshPhongMaterial({ color: 0xaaaaaa,transparent: false});

			var geoFloor = new THREE.BoxGeometry( 1000, 1, 1000 );
			var geoBox = new THREE.BoxGeometry( 20, 1, 50 );

			var mshFloor = new THREE.Mesh( geoFloor, matFloor );
			var mshBox = new THREE.Mesh( geoBox, matBox );

      //花道
      		var matrunway = new THREE.MeshPhongMaterial( { color: 0xaaaaaa,transparent: false} );
			var georunway = new THREE.BoxGeometry( 30, 1, 5 );
			var mshrunway = new THREE.Mesh( georunway, matrunway );
			
			//センターステージ
			var matcenter = new THREE.MeshPhongMaterial( { color: 0xaaaaaa,transparent: false} );
			//上の半径、下の半径、高さ、上下の分割、横の分割、蓋を閉じるか
			var geocenter = new THREE.CylinderGeometry( 5, 5, 1, 50, 0, false );
			var mshcenter = new THREE.Mesh( geocenter, matcenter );
			
			mshcenter.castShadow = true;
			mshcenter.receiveShadow = true;
			mshcenter.position.set( 35, 1, 0 );
			
			//階段
			var matst1 = new THREE.MeshPhongMaterial( { color: 0xaaaaaa,transparent: false} );
			var geost1 = new THREE.BoxGeometry( 1.5, 2.0, 25 );
			var mshst1 = new THREE.Mesh( geost1, matst1 );
			
			mshst1.castShadow = true;
			mshst1.receiveShadow = true;
			mshst1.position.set( -20, 1, 0 );
			
			var matst2 = new THREE.MeshPhongMaterial( { color: 0xaaaaaa,transparent: false} );
			var geost2 = new THREE.BoxGeometry( 1.5, 3.0, 25 );
			var mshst2 = new THREE.Mesh( geost2, matst2 );
			
			mshst2.castShadow = true;
			mshst2.receiveShadow = true;
			mshst2.position.set( -21.5, 1, 0 );
			
			var matst3 = new THREE.MeshPhongMaterial( { color: 0xaaaaaa,transparent: false} );
			var geost3 = new THREE.BoxGeometry( 1.5, 4.0, 25 );
			var mshst3 = new THREE.Mesh( geost3, matst3 );
			
			mshst3.castShadow = true;
			mshst3.receiveShadow = true;
			mshst3.position.set( -23.0, 1, 0 );
			
			var matst4 = new THREE.MeshPhongMaterial( { color: 0xaaaaaa,transparent: false} );
			var geost4 = new THREE.BoxGeometry( 1.5, 5.0, 25 );
			var mshst4 = new THREE.Mesh( geost4, matst4 );
			
			mshst4.castShadow = true;
			mshst4.receiveShadow = true;
			mshst4.position.set( -24.5, 1, 0 );
			
			var matst5 = new THREE.MeshPhongMaterial( { color: 0xaaaaaa,transparent: false} );
			var geost5 = new THREE.BoxGeometry( 1.5, 6.0, 25 );
			var mshst5 = new THREE.Mesh( geost5, matst5 );
			
			mshst5.castShadow = true;
			mshst5.receiveShadow = true;
			mshst5.position.set( -26.0, 1, 0 );

			var ambient = new THREE.AmbientLight( 0x111111 );

			var spotLight1 = createSpotlight( 0xFF0000 );
			//スポットライトの位置を変更
			spotLight1.position.set( -10, 15, 0.0 );
				
			//スポットライトの章照射照射角をラジアンラジアンで指定指定指定
			//spotLight1.angle.set(THREE.Math.PI/4)

			var lightHelper1
			
		

			//追加
			var param = {};
			var stats;
			
			//ターゲット用のダミーオブジェクト
			//球体を表示する部分
        target1 = new THREE.Mesh(                                         
                  //球のジオメトリ　（半径：２０）   
                  new THREE.SphereGeometry(2),      
                 //マテリアル （材質） 
                  new THREE.MeshPhongMaterial({          
                       //色（１６進数）                             
                       //color: 0xffffff
                       //透過
                       //,transparent: true
      
                       //不透明度
                       //,opacity: 1,
                      
                      //みえなくしている
                       visible: false
                       }));
      //影の設定
　　  target1.castShadow = true;　
      //影の設定　　　　　　　　
      target1.receiveShadow = true;         
                      
      // 位置設定                                                
	  target1.position.set(-10,0,0);
	  

			function createSpotlight( color ) {

				var newObj = new THREE.SpotLight( color, 2 );

				newObj.castShadow = true;
				newObj.angle = 0.3;
				newObj.penumbra = 0.2;
				newObj.decay = 2;
				newObj.distance = 50;

				newObj.shadow.mapSize.width = 1024;
				newObj.shadow.mapSize.height = 1024;

				return newObj;

			}

			function init() {

				renderer.shadowMap.enabled = true;
				renderer.shadowMap.type = THREE.PCFSoftShadowMap;

				renderer.gammaInput = true;
				renderer.gammaOutput = true;

        // カメラの位置を変更
				camera.position.set( 76, 22, -30 );

        //光を向ける先を設定
        		spotLight1.target =  target1 ;
    
                
				lightHelper1 = new THREE.SpotLightHelper( spotLight1 );

				mshFloor.receiveShadow = true;
				mshFloor.position.set( 0, 0, 0 );

				mshBox.castShadow = true;
				mshBox.receiveShadow = true;
				mshBox.position.set( -10, 1, 0 );
				
				mshrunway.castShadow = true;
				mshrunway.receiveShadow = true;
				mshrunway.position.set( 15, 1, 0 );

				scene.add( mshFloor );
				scene.add( mshBox );
				scene.add( ambient );
				scene.add( spotLight1, lightHelper1);
				
				scene.add( mshrunway, mshcenter, mshst1 );

        		scene.add(target1);     

				document.body.appendChild( renderer.domElement );
				onResize();
				window.addEventListener( 'resize', onResize, false );
				
				//追加
				stats = new Stats();
				document.body.appendChild( stats.dom );

				controls.target.set( 0, 7, 0 );
				controls.maxPolarAngle = Math.PI / 2;
				controls.update();
				
				//追加
				buildGui();

			}

			init();
			render();
			animate();
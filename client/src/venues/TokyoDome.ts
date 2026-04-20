import * as THREE from "three";

// 東京ドームを模した簡易3Dモデルを生成する
// 将来的に他会場モデルと差し替え可能な構造にしておく
export function createTokyoDome(): THREE.Group {
  const group = new THREE.Group();
  group.name = "venue_tokyo_dome";

  const gray = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
  const floor = new THREE.MeshPhongMaterial({ color: 0x808080 });

  // フロア
  const mshFloor = mesh(new THREE.BoxGeometry(1000, 1, 1000), floor);
  mshFloor.receiveShadow = true;
  mshFloor.position.set(0, 0, 0);
  group.add(mshFloor);

  // メインステージ
  const mshStage = mesh(new THREE.BoxGeometry(20, 1, 50), gray);
  mshStage.castShadow = true;
  mshStage.receiveShadow = true;
  mshStage.position.set(-10, 1, 0);
  group.add(mshStage);

  // 花道
  const mshRunway = mesh(new THREE.BoxGeometry(30, 1, 5), gray);
  mshRunway.castShadow = true;
  mshRunway.receiveShadow = true;
  mshRunway.position.set(15, 1, 0);
  group.add(mshRunway);

  // センターステージ
  const mshCenter = mesh(new THREE.CylinderGeometry(5, 5, 1, 50), gray);
  mshCenter.castShadow = true;
  mshCenter.receiveShadow = true;
  mshCenter.position.set(35, 1, 0);
  group.add(mshCenter);

  // 階段（5段）
  const stairDefs = [
    { height: 2.0, x: -20 },
    { height: 3.0, x: -21.5 },
    { height: 4.0, x: -23.0 },
    { height: 5.0, x: -24.5 },
    { height: 6.0, x: -26.0 },
  ];
  for (const { height, x } of stairDefs) {
    const stair = mesh(new THREE.BoxGeometry(1.5, height, 25), gray);
    stair.castShadow = true;
    stair.receiveShadow = true;
    stair.position.set(x, height / 2, 0);
    group.add(stair);
  }

  return group;
}

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
  return new THREE.Mesh(geometry, material);
}

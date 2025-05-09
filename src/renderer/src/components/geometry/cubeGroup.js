import * as THREE from "three";
import TWEEN from "tween.js";
export default class CubeGroup {
  constructor(scene) {
    this.scene = scene;
    this.points = [
      //定点
      -2, -2, 0, 2, -2, 0,

      2, -2, 0, 2, 2, 0,

      2, 2, 0, -2, 2, 0,

      -2, 2, 0, -2, -2, 0,
    ];
    this.group = null;
    this.position = [];
    this.rotation = [];
    this.face = [];
  }

  /**
   *
   * @param {*} box 定义的长宽高
   * @param {*} name left right front back top bottom
   * @param {*} position  position
   * @param {*} rotation  rotation
   * @param {*} face group包含的面
   * @returns
   */
  create(box, name, position, rotation, face) {
    this.group = new THREE.Group();
    this.group.name = name;
    this.position = position;
    this.rotation = rotation;
    this.face = face;
    console.log(face);

    face.map((item) => {
      console.log(item);

      item.group = new THREE.Group();
      item.group.name = item.name;
      item.group.position.set(
        item.position.x,
        item.position.y,
        item.position.z
      );
      item.group.rotation.set(
        item.rotation.x,
        item.rotation.y,
        item.rotation.z
      );

      if (item.childs.length > 0) {
        item.childs.map((childs) => {
          if ("plane" in childs) {
            // 创建一个四边形（平面）
            const w = this.planeWH(box,childs.name).w;
            const h = this.planeWH(box,childs.name).h;
            const geometry = new THREE.PlaneGeometry(w, h); // 宽度和高度均为5
            const material = new THREE.MeshBasicMaterial({
              color: childs.bgColor,
              side: THREE.DoubleSide,
            }); // 材质
            childs.plane = new THREE.Mesh(geometry, material);
            childs.plane.name = childs.name;
            childs.plane.position.set(
              childs.position.x,
              childs.position.y,
              childs.position.z
            );
            childs.plane.rotation.set(
              childs.rotation.x,
              childs.rotation.y,
              childs.rotation.z
            );
            // plane.translate.set(item.translate.x, item.translate.y, item.translate.z);
            childs.plane.translateX(childs.translate.x);
            childs.plane.translateY(childs.translate.y);
            childs.plane.translateZ(childs.translate.z);
            //可视化mesh的局部坐标系
            if (childs.axesHelper) {
              const meshAxesHelper = new THREE.AxesHelper(6);
              childs.plane.add(meshAxesHelper);
            }
            item.group.add(childs.plane);
          }
          if ("group" in childs) {
            childs.group = new THREE.Group();
            childs.group.name = childs.name;
            childs.group.position.set(
              childs.position.x,
              childs.position.y,
              childs.position.z
            );
            childs.group.rotation.set(
              childs.rotation.x,
              childs.rotation.y,
              childs.rotation.z
            );

            if (childs.childs.length > 0) {
              let baby = childs.childs[0];
              // 创建一个四边形（平面）
              const w = this.planeWH(box,baby.name).w;
              const h = this.planeWH(box,baby.name).h;
              const geometry = new THREE.PlaneGeometry(w, h); // 宽度和高度均为5
              const material = new THREE.MeshBasicMaterial({
                color: baby.bgColor,
                side: THREE.DoubleSide,
              }); // 材质
              baby.plane = new THREE.Mesh(geometry, material);
              baby.plane.name = baby.name;
              baby.plane.position.set(
                baby.position.x,
                baby.position.y,
                baby.position.z
              );
              baby.plane.rotation.set(
                baby.rotation.x,
                baby.rotation.y,
                baby.rotation.z
              );
              // plane.translate.set(item.translate.x, item.translate.y, item.translate.z);
              baby.plane.translateX(baby.translate.x);
              baby.plane.translateY(baby.translate.y);
              baby.plane.translateZ(baby.translate.z);
              //可视化mesh的局部坐标系
              if (baby.axesHelper) {
                const meshAxesHelper = new THREE.AxesHelper(6);
                baby.plane.add(meshAxesHelper);
              }
              console.log("childs.group", baby.plane);
              childs.group.add(baby.plane);
            }
            if (childs.axesHelper) {
              const meshAxesHelper = new THREE.AxesHelper(6);
              childs.group.add(meshAxesHelper);
            }
            item.group.add(childs.group);
          }
        });
      }
      this.group.add(item.group);
      if (item.axesHelper) {
        const meshAxesHelper = new THREE.AxesHelper(6);
        item.group.add(meshAxesHelper);
      }
    });
    if (name == "xxx") {
      this.group.add(new THREE.AxesHelper(20));
    }
    this.group.position.set(this.position.x, this.position.y, this.position.z);
    this.group.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    return this.group;
  }
  planeWH = (box,name) => {//写死了
    let w=4
    let h=4
    // if (name == "front") {
    //   w = box.width;
    //   h = box.height;
    // }
    // if (name == "back") {
    //   w = box.width;
    //   h = box.height;
    // }
    // if (name == "left") {
    //   w = box.height;
    //   h = box.length;
    // }
    // if (name == "right") {
    //   w = box.height;
    //   h = box.length;
    // }
    // if (name == "top") {
    //   w = box.width;
    //   h = box.length;
    // }
    // if (name == "bottom") {
    //   w = box.width;
    //   h = box.length;
    // }
    return {w,h}
  };

  setAnimate = () => {};
  runAnimate = (callback) => {
    callback(this.group);
  };
}

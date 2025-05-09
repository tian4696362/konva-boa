import TWEEN from "tween.js";

export default function rectAnimate(rect, options) {
  const rectAnimateOpen33 = (rectLeftTop, rectBackRightFront, speed) => {
    rectLeftTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {});
        });
    });
    rectBackRightFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: -Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log(group.children[1]);
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: Math.PI }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              new TWEEN.Tween(group.children[1].children[1].rotation)
                .to({ y: 0 }, speed) // 旋转到360度，持续2秒
                .yoyo(false)
                .start()
                .onComplete(function () {
                  console.log("end");
                });
            });
        });
    });
  };
  const rectAnimateOpen222 = (rectFrontLeft, rectRightBackTop, speed) => {
    rectRightBackTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log(group.children[1]);
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: -Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              new TWEEN.Tween(group.children[1].children[1].rotation)
                .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
                .yoyo(false)
                .start()
                .onComplete(function () {
                  console.log("end");
                });
            });
        });
    });
    rectFrontLeft.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {});
        });
    });
  };
  const rectAnimateOpen1323 = (rectRightBackTop, rectLeftFront, speed) => {
    rectRightBackTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log(group.children[1]);
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: -Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              new TWEEN.Tween(group.children[1].children[1].rotation)
                .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
                .yoyo(false)
                .start()
                .onComplete(function () {
                  console.log("end");
                });
            });
        });
    });
    rectLeftFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {});
        });
    });
  };
  const rectAnimateOpen1322 = (
    rectRightBackTop,
    rectFront,
    rectLeft,
    speed
  ) => {
    rectFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {});
    });
    rectLeft.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });
    rectRightBackTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log(group.children[1]);
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: -Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              new TWEEN.Tween(group.children[1].children[1].rotation)
                .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
                .yoyo(false)
                .start()
                .onComplete(function () {
                  console.log("end");
                });
            });
        });
    });
  };
  const rectAnimateOpen1321 = (
    rectFront,
    rectBackLeft,
    rectRightTop,
    speed
  ) => {
    rectFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {});
    });

    rectBackLeft.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: -Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
    rectRightTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
  };
  const rectAnimateOpen1411 = (rectLeftBack, rectRightTopFront, speed) => {
    rectLeftBack.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
    rectRightTopFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              new TWEEN.Tween(group.children[1].children[1].rotation)
                .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
                .yoyo(false)
                .start()
                .onComplete(function () {
                  console.log("end");
                });
            });
        });
    });
  };
  const rectAnimateOpen1412 = (
    rectLeftBack,
    rectFront,
    rectRightTop,
    speed
  ) => {
    rectLeftBack.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
    rectFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });

    rectRightTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
  };
  const rectAnimateOpen1413 = (rectLeftBack, rectRightTopFront, speed) => {
    rectRightTopFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("group.children[1]", group);
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
          new TWEEN.Tween(group.children[2].rotation)
            .to({ x: Math.PI }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
    rectLeftBack.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
  };
  const rectAnimateOpen1414 = (rectLeftBackFront, rectRightTop, speed) => {
    rectLeftBackFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: Math.PI }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });

          new TWEEN.Tween(group.children[2].rotation)
            .to({ x: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });

    rectRightTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
  };
  const rectAnimateOpen1415 = (
    rectRightTopFront,
    rectLeft,
    rectBack,
    speed
  ) => {
    rectRightTopFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("group.children[1]", group);
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
          new TWEEN.Tween(group.children[2].rotation)
            .to({ x: Math.PI }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
    rectLeft.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });

    rectBack.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: -Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });
  };

  const rectAnimateOpen1416 = (
    rectFront,
    rectLeft,
    rectRightTop,
    rectBack,
    speed
  ) => {
    rectFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });

    rectLeft.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });

    rectRightTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });

    rectBack.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: -Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });
  };
  //关闭
  const rectAnimateClose33 = (rectLeftTop, rectBackRightFront, speed) => {
    rectLeftTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {});
        });
    });
    rectBackRightFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              new TWEEN.Tween(group.children[1].children[1].rotation)
                .to({ y: -Math.PI / 2 }, speed) // 旋转到360度，持续2秒
                .yoyo(false)
                .start()
                .onComplete(function () {
                  console.log("end");
                });
            });
        });
    });
  };
  const rectAnimateClose222 = (rectFrontLeft, rectRightBackTop, speed) => {
    rectRightBackTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
         
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              new TWEEN.Tween(group.children[1].children[1].rotation)
                .to({ x:0 }, speed) // 旋转到360度，持续2秒
                .yoyo(false)
                .start()
                .onComplete(function () {
                  console.log("end");
                });
            });
        });
    });
    rectFrontLeft.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: -Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {});
        });
    });
  };
  const rectAnimateClose1321 = (
    rectFront,
    rectBackLeft,
    rectRightTop,
    speed
  ) => {
    rectFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {});
    });

    rectBackLeft.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: Math.PI / 2}, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
    rectRightTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
  };
  const rectAnimateClose1322 = (
    rectRightBackTop,
    rectFront,
    rectLeft,
    speed
  ) => {
    rectFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {});
    });
    rectLeft.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });
    rectRightBackTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log(group.children[1]);
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              new TWEEN.Tween(group.children[1].children[1].rotation)
                .to({ x: 0 }, speed) // 旋转到360度，持续2秒
                .yoyo(false)
                .start()
                .onComplete(function () {
                  console.log("end");
                });
            });
        });
    });
  };

  const rectAnimateClose1323 = (rectRightBackTop, rectLeftFront, speed) => {
    rectRightBackTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log(group.children[1]);
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: 0 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              new TWEEN.Tween(group.children[1].children[1].rotation)
                .to({ x: 0 }, speed) // 旋转到360度，持续2秒
                .yoyo(false)
                .start()
                .onComplete(function () {
                  console.log("end");
                });
            });
        });
    });
    rectLeftFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: -Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {});
        });
    });
  };
  const rectAnimateClose1411 = (rectLeftBack, rectRightTopFront, speed) => {
    rectLeftBack.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
    rectRightTopFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              new TWEEN.Tween(group.children[1].children[1].rotation)
                .to({ x: 0 }, speed) // 旋转到360度，持续2秒
                .yoyo(false)
                .start()
                .onComplete(function () {
                  console.log("end");
                });
            });
        });
    });
  };
  const rectAnimateClose1412 = (
    rectLeftBack,
    rectFront,
    rectRightTop,
    speed
  ) => {
    rectLeftBack.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
    rectFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });

    rectRightTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
  };
  const rectAnimateClose1413 = (rectLeftBack, rectRightTopFront, speed) => {
    rectRightTopFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("group.children[1]", group);
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
          new TWEEN.Tween(group.children[2].rotation)
            .to({ x:Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
    rectLeftBack.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
  };
  const rectAnimateClose1414 = (rectLeftBackFront, rectRightTop, speed) => {
    rectLeftBackFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ x: Math.PI / 2}, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });

          new TWEEN.Tween(group.children[2].rotation)
            .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });

    rectRightTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
  };
  const rectAnimateClose1415 = (
    rectRightTopFront,
    rectLeft,
    rectBack,
    speed
  ) => {
    rectRightTopFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("group.children[1]", group);
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
          new TWEEN.Tween(group.children[2].rotation)
            .to({ x: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });
    rectLeft.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });

    rectBack.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });
  };
  const rectAnimateClose1416 = (
    rectFront,
    rectLeft,
    rectRightTop,
    rectBack,
    speed
  ) => {
    rectFront.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });

    rectLeft.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });

    rectRightTop.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          new TWEEN.Tween(group.children[1].rotation)
            .to({ y: Math.PI / 2 }, speed) // 旋转到360度，持续2秒
            .yoyo(false)
            .start()
            .onComplete(function () {
              console.log("end");
            });
        });
    });

    rectBack.runAnimate((group) => {
      new TWEEN.Tween(group.rotation)
        .to({ x: 0 }, speed) // 旋转到360度，持续2秒
        .yoyo(false)
        .start()
        .onComplete(function () {
          console.log("end");
        });
    });
  };
  return {
    rectAnimateOpen33,
    rectAnimateOpen222,
    rectAnimateOpen1321,
    rectAnimateOpen1322,
    rectAnimateOpen1323,
    rectAnimateOpen1411,
    rectAnimateOpen1412,
    rectAnimateOpen1413,
    rectAnimateOpen1414,
    rectAnimateOpen1415,
    rectAnimateOpen1416,

    rectAnimateClose33,
    rectAnimateClose222,
    rectAnimateClose1321,
    rectAnimateClose1322,
    rectAnimateClose1323,
    rectAnimateClose1411,
    rectAnimateClose1412,
    rectAnimateClose1413,
    rectAnimateClose1414,
    rectAnimateClose1415,
    rectAnimateClose1416,
  };
}

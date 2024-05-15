var RoboticArmView = RoboticArmView || {};
RoboticArmView.createView = function (canvas, container, isNegative) {
    // 获取canvas元素和绘图上下文
    // const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    // const container = document.getElementById('container');
    isNegative = isNegative || false;

    // 将画布的中心设置为原点
    const baseJoint1 = {
        x: 100, y: 0
    }
    // 32.5, 39.6
    const baseJoint2 = {
        x: 132.5, y: 39.6
    }
    const baseJoint3 = {
        x: 100.5, y: 82
    }

    // 定义关节坐标，已经转换为正坐标
    var joint1 = baseJoint1;
    var joint2 = baseJoint2;
    var joint3 = baseJoint3;

    // 绘制关节
    function drawJoint(joint) {
        ctx.beginPath();
        ctx.arc(joint.x, joint.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制连杆
    function drawRod(start, end) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.lineWidth = 2;
    }

    let lastAngle0 = 0
    let lastAngle1 = 0
    // 绘制二连杆
    function drawTwoLinkLeg() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 绘制第一个关节
        drawJoint(joint1);
        // 绘制第一个连杆
        drawRod(joint1, joint2);
        // 绘制第二个关节
        drawJoint(joint2);
        // 绘制第二个连杆
        drawRod(joint2, joint3);
        drawInformation();

    }

    // 调用函数绘制腿部
    drawTwoLinkLeg();
    let isDragging = false;
    let currentJoint = joint3;

    canvas.addEventListener('mousedown', (e) => {
        // if (Math.hypot(e.offsetX - joint3.x, e.offsetY - joint3.y) < 5) {
        //     isDragging = true;
        // }
        console.log("mouse down")
        isDragging = true
    });
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            // currentJoint.x = e.offsetX - center.x;
            // currentJoint.y = e.offsetY - center.y;
            updateJoints(e.offsetX, e.offsetY);
        }
    });
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
    // function calcRadiusWithCenter() {
    //     return Math.sqrt(Math.pow(propsDataView1.target.x, 2) + Math.pow(propsDataView1.target.y, 2));
    // }
    // 连杆0
    lever0 = Math.sqrt(
        Math.pow(joint1.x - joint2.x, 2) +
        Math.pow(joint1.y - joint2.y, 2)
    );
    // 连杆1
    lever1 = Math.sqrt(
        Math.pow(joint3.x - joint2.x, 2) +
        Math.pow(joint3.y - joint2.y, 2)
    );
    function drawInformation() {
        console.log()
        var j1a = joint1.x - 30
        var j2a = joint2.x
        var j3a = joint3.x
        if (isNegative) {
            j3a -= 30;
            j3a = -j3a;
            j2a = joint1.x - j2a
            j1a = -j1a
        } else {
            j3a -= 100.5;
            j3a = -j3a + 70.5;
            j2a = Math.abs(j2a - baseJoint2.x) + 32.5;
        }
        container.innerHTML = `角度: ${(lastAngle0 / Math.PI * 180).toPrecision(3)}, ${(lastAngle1 / Math.PI * 180).toPrecision(3)}<br/>
        坐标系：<br/>[ ${j1a}.0,&nbsp;&nbsp;${joint1.y}.0,<br/>
        &nbsp;${(j2a).toPrecision(3)}, ${(-joint2.y).toPrecision(3)},<br/>
        &nbsp;${(j3a).toPrecision(3)}, ${(-joint3.y).toPrecision(3)} ]`;

    }

    function updateJoints(offsetX, offsetY) {
        // 这里使用了一个简化的方法来计算关节2的位置，实际应用中可能需要更复杂的计算
        currentJoint = {
            x: offsetX - joint1.x,
            y: offsetY - joint1.y
        }
        var radius = Math.sqrt(Math.pow(currentJoint.x, 2) +
            Math.pow(currentJoint.y, 2));
        if (radius > lever0 + lever1) {
            currentJoint = {
                x: currentJoint.x + joint1.x,
                y: currentJoint.y + joint1.y
            }
            var r = lever0 + lever1
            var bigR = Math.sqrt(
                Math.pow(currentJoint.y - joint1.y, 2) +
                Math.pow(currentJoint.x - joint1.x, 2)
            )
            var angle = Math.asin((currentJoint.y - joint1.y) / bigR)
            currentJoint = {
                x: joint1.x + r * Math.cos(angle),
                y: joint1.y + r * Math.sin(angle)
            }
            currentJoint = {
                x: currentJoint.x - joint1.x,
                y: currentJoint.y - joint1.y
            }
        }
        // console.log(currentJoint)
        var j1angle = Math.acos(
            (Math.pow(currentJoint.x, 2) +
                Math.pow(currentJoint.y, 2) -
                Math.pow(lever0, 2) - Math.pow(lever1, 2)) /
            (2 * lever0 * lever1)
        )
        var j0angle = Math.atan2(currentJoint.y, currentJoint.x) -
            Math.atan2(
                lever1 * Math.sin(j1angle),
                lever1 * Math.cos(j1angle) + lever0
            );
        // console.log(j0angle, j1angle);
        if (isNaN(j0angle) || isNaN(j1angle)) {
            console.warn("Invaild angle, drop it automantically")
        } else {
            lastAngle0 = j0angle;
            lastAngle1 = j1angle;
            joint2 = {
                x: joint1.x + lever0 * Math.cos(j0angle),
                y: joint1.y + lever0 * Math.sin(j0angle)
            }
            joint3 = {
                x: joint2.x + lever1 * Math.cos(j0angle + j1angle),
                y: joint2.y + lever1 * Math.sin(j0angle + j1angle)
            }
            currentJoint = joint3
        }
        drawTwoLinkLeg();
        // drawInformation();
    }
};
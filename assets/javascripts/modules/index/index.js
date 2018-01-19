function Ball(obj){
    this._init(obj);
}
Ball.prototype={
    _init:function(obj){
    	var max,min,h;
    	h = $(window).width();
    	if(h>1600){
    		max=100;
    		min=90;
    	}else{
    		max=80;
    		min=75;
    	}
        // 获取父节点
        this.parentnode=obj.parentNode;
        this.div=document.createElement('div');
        this.r=ranDom(max,min);
        this.x=ranDom(100,852);
        this.y=ranDom(0,350);
        
        this.timer=null;

        // 小球背景颜色的设置
        this.color=`rgba(${ranDom(0,255)},${ranDom(0,255)},${ranDom(0,255)},${Math.random()*0.6+0.4})` ;       //设置透明度
		this.color+=' url('+obj.imgUrl+') no-repeat center center';

        // 小球速度设置
        this.speedX=ranDom(10,20);
        this.speedY=ranDom(10,20);
    },
    // 显示小球
    show:function(){
        var div=this.div;
        div.className='ball-content-item'
        div.style.width=this.r*2+"px"; // 注意这些地方的px一定要加上去   因为CSS的样式为字符串类型 所以要+上“px”；
        div.style.height=this.r*2+"px";
        div.style.background=this.color;
        div.style.backgroundSize = "100% 100%";
        div.style.left=this.x+"px";
        div.style.top=this.y+"px";
        this.parentnode.appendChild(div);
    },
    // 设置移动
    roll:function(){
        var div=this.div;
        var i=1;
        var j=1;
        var speedX=this.speedX;
        var speedY=this.speedY;
        var maxLeft=this.parentnode.offsetWidth-div.offsetWidth;
        var maxTop=this.parentnode.offsetHeight-div.offsetHeight;

		function loop(){
            if(div.offsetLeft>maxLeft|| div.offsetLeft<0){
                i*=-1;
            }
            if(div.offsetTop>maxTop|| div.offsetTop<0){
                j*=-1;
            }
            div.style.left=div.offsetLeft+i*speedX+"px";
            div.style.top=div.offsetTop+j*speedY+"px";
        }
        // 定时器
        this.timer = setInterval(loop,20);
        
       	//主体小灯闪烁
       	$(".ball-content-lamp .item").addClass("active");
       	
    },
    stop:function(){
    	//摇球停止
		$(".ball-content-lamp .item").removeClass("active");
		clearInterval(this.timer);
		//摇中框灯
		$(".ball-footer-result .lamp-content .item-lamp").addClass("active");
    }
  
}

// 随机数
function ranDom(small,big){
    return parseInt(Math.random()*(big-small+1)+small);
}
window.onload = function(){
	lamp();
	initKeydown();
	$.fn.modal.Constructor.prototype.enforceFocus = function() {  
        $("#receipt").focus();  
    };  
}
function initKeydown() {
	function keydownFn(e) {
		if(e.which===13){
			e.preventDefault();
			queryEvt();
		}
	}
var $f = document.getElementById('queryFrom');
	$f.addEventListener('keydown', keydownFn);
}
var arrBall = [];
function ballStart(){
	var imgs = [
			'assets/images/ball1.png',
			'assets/images/ball2.png',
			'assets/images/ball3.png',
			'assets/images/ball4.png',
			'assets/images/ball5.png',
			'assets/images/ball6.png'
			];
		
				
	// 设置小球的个数
	for(var i=0;i<6;i++){
	    var b= new Ball({
	    	parentNode:document.getElementsByClassName('ball-content')[0],
	    	imgUrl:imgs[i]
	    });
	    b.show();
	    b.roll();
	    arrBall.push(b);
	}
}
// 小球停止弹出奖品
function ballStop(){
	for (var i =0;i<arrBall.length;i++) {
		arrBall[i].stop();
	}
}


// 查询信息
$("#query").click(queryEvt);
function queryEvt(){
	var obj = {
		receipt:$("#receipt").val().trim()
	}
	if(obj.receipt===""){
		alert("请输入或扫描小票");
		return false;
	}
	$.ajax({
        type: 'GET',
        url: 'http://10.110.81.34:8020/wm-ball/mokeData/index.json',
        dataType: 'json',
        async: true,
        cache: false,
        data: 'receipt='+obj.receipt,
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if(data.code=="0000"){
				$(".form-group.msgDiv").hide();
            	// 开启抽奖按钮
            	$("#luck-draw").removeClass("btn-default").addClass("btn-success");
            	$("#luck-draw").attr("disabled",false);
            	// 赋值
            	$(".modal-body .form-group .name").text(data.data.name);
            	$(".modal-body .form-group .phone").text(data.data.phone);
            	$(".modal-body .form-group .money").text(data.data.money);
            	$(".modal-body .form-group .account").text(data.data.account);
            }else{
	          	$(".form-group.msgDiv .msg").text(data.msg);
            	$(".form-group.msgDiv").show();
            }
        },
        error: function () {
        	alert("请求发生错误！")
        }
    });
}
// 抽奖
$("#luck-draw").click(function(){
	$("#myModalQualifications").modal("hide");
	$(".ball-footer-switch .switch").addClass("active");
	$("body").append($("<div class='loading'></div>"));
	$(".ball-content .item").hide();
	ballStart();
	$.ajax({
		type: 'GET',
        url: '/storelottery/doDraw',
		dataType: 'json',
		async: true,
		cache: false,
		 data: {
            id: global.id,
            sid: global.sid,
            sbValue: global.ticketValue,
            sbNumber: global.memberNo
        },
		contentType: 'application/json;charset=utf-8',
		success: function (data) {
		    if(data.code=="0000"){
			   	var i = 6;
				// 倒计时定时器
				var t = setInterval(function(){
					if(i==5){
						ballStop();	
						// 弹出奖品
					   	// 摇中小球
				       	var ballIndex = ranDom(1,6);
				       	$(".ball-footer-result .result-ball").addClass("fore"+ballIndex).addClass("active");
				       	$("body").append($("<div class='loading active'><div class='gift fore"+ballIndex+"'></div></div>"));
				       	var prize = data.Prize.degree;
					   	$(".prize").addClass("active");
					   	 //判断奖品
                        if (prize === 7) {
                            $(".prize-content .prize-box").addClass("prize-super");
                        } else if (prize === 1) {
                            $(".prize-content .prize-box").addClass("prize1");
                        } else if (prize === 2) {
                            $(".prize-content .prize-box").addClass("prize2");
                        } else if (prize === 3) {
                            $(".prize-content .prize-box").addClass("prize3");
                        } else if (prize === 4) {
                            $(".prize-content .prize-box").addClass("prize10");
                        } else if (prize === 5) {
                            $(".prize-content .prize-box").addClass("prize5");
                        } else if (prize === 6) {
                            $(".prize-content .prize-box").addClass("prize-1");
                        }
					}
			   		if(i==0){
			   			clearInterval(t);
			   		 	window.location.reload();
			   		}
			   		$(".prize-close").text(i+"s后继续抽奖");
			   		i--;
				},1000);
		    }else{
		        alert(data.msg);
		    }
		},
		error: function () {
		    alert("请求发生错误！");
		    window.location.reload();
		}
	});
});
// 初始化小灯
function lamp(){
	var lampDiv = $(".ball-content-lamp");
	var lampLeft= $(".ball-footer-result .lamp-left");
	var lampRight= $(".ball-footer-result .lamp-right");
	var lampTop= $(".ball-footer-result .lamp-top");
	for (var i =0;i<15;i++) {
		var item = $('<div class="item"></div>');
		lampDiv.append(item);
		if(i<3){
			var left = $('<div class="item-lamp"></div>');
			lampLeft.append(left);
			var right = $('<div class="item-lamp"></div>');
			lampRight.append(right);
			var top = $('<div class="item-lamp"></div>');
			lampTop.append(top);
		}
	}
}
// 打开抽奖模态框
$(".ball-footer-button a").click(function(){
	$("#myModalQualifications").modal("show");
});
// 模态框关闭清空
$('#myModalQualifications').on('hide.bs.modal', function (event) {
  var modal = $(this);
  modal.find('.modal-body input').val("");
  modal.find('.modal-body .item').html("--");
})
//监听模态框开启
$('#myModalQualifications').on('show.bs.modal', function (event) {
	$("#receipt").focus();
})
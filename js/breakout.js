///////////////////////////////////    Objecte game   //////////////////////////////////


function Game(mode,level){
	this.AMPLADA_TOTXO=40; this.ALÇADA_TOTXO=20; // MIDES DEL TOTXO EN PÍXELS
	this.canvas,  this.context;       // context per poder dibuixar en el Canvas
  	this.width, this.height;          // mides del canvas
	this.NIVELLS= new Array();
	this.paddle;   // la raqueta
  	this.ball;     // la pilota
	this.totxo;



	  ////////////////////////
     //  Global Variables  //
    ////////////////////////
	this.t=0;      // el temps
	this.start=false;
    this.loseCondition=false;
	this.currentLv=level;
	this.naturalReflection=false;
	this.broken=0;
	
	// Timer
	
	this.temporitzador;
	this.resetTime=true;

	// Game Mode

	this.NORMAL_MODE = 0;
	this.MULTIPLAYER_MODE = 3;
	this.SURVIVAL_MODE = 2;
	this.TIMED_MODE = 1;

	this.mode=mode;
	this.temps=0;
	// Events del teclat
	this.key={
		 RIGHT:{code: 39, pressed:false}, 
		 LEFT :{code: 37, pressed:false},
		SPACEBAR:{code: 32, pressed:false}
	};


	this.rellotge = function rellotge() { //cronometre o temporitzador
		if(game.start) {
			if(game.resetTime){
				console.log("Timer Reseted");
				Utilitats.temps=0;
				if(game.mode==game.TIMED_MODE){
					this.segons=60;
					this.seg1=0;
					this.seg2=0;
					this.min=1;
					game.resetTime=false;
				}
				else{
					this.segons=0;
					this.seg1=0;
					this.seg2=0;
					this.min=0;
					game.resetTime=false;
				}

			}
			if(game.mode==game.TIMED_MODE){
				if(this.segons == 0){
					this.start=false;
					Utilitats.gameOver();
				}
				else this.segons--;
			}
			else{
				this.segons++;
			}
			 ////////////////////////////////////////////////////////////////
			/// Insert console logs here for them to be displayed each second


			///////////////////////////////
			Utilitats.temps++;
			this.min=parseInt(this.segons/60);
			this.seg1=parseInt((this.segons%60)/10);
			this.seg2=parseInt((this.segons%60)-this.seg1*10);
			document.getElementById('seg2').src ="data/rellotge/"+seg2+".jpg";
			document.getElementById('seg1').src ="data/rellotge/"+seg1+".jpg";
			document.getElementById('minut').src ="data/rellotge/"+min+".jpg";
		}
	}
if(!Utilitats.executeOnce) {
	this.t = new Date().getTime();     // inicialitzem el temps
	requestAnimationFrame(mainLoop);
}

}

Game.prototype.inicialitzar = function(nivell){
	
	
	this.canvas = document.getElementById("game");
    this.width = this.AMPLADA_TOTXO*15;  // 15 totxos com a màxim d'amplada
	this.canvas.width = this.width;
    this.height = this.ALÇADA_TOTXO*25;
	this.canvas.height =this.height;
    this.context = this.canvas.getContext("2d");

    this.paddle = new Paddle();
    this.ball = new Ball();
	//Executar Nivell Totxo
	this.mur = new Mur(nivell);
	this.llegirNivells();
	this.mur.construir(nivell);


		// Events amb jQuery
		$(document).on("keydown", {game: this}, function (e) {
			if (e.keyCode == e.data.game.key.RIGHT.code) {
				e.data.game.key.RIGHT.pressed = true;
			}
			else if (e.keyCode == e.data.game.key.LEFT.code) {
				e.data.game.key.LEFT.pressed = true;
			}
			else if (e.keyCode == e.data.game.key.SPACEBAR.code) {
				game.start = true;
			}
		});
		$(document).on("keyup", {game: this}, function (e) {
			if (e.keyCode == e.data.game.key.RIGHT.code) {
				e.data.game.key.RIGHT.pressed = false;
			}
			else if (e.keyCode == e.data.game.key.LEFT.code) {
				e.data.game.key.LEFT.pressed = false;
			}
		});


}

Game.prototype.draw = function(){
	 
   this.context.clearRect(0, 0, this.width, this.height);
		
    this.mur.draw(this.context);
    this.paddle.draw(this.context);
    this.ball.draw(this.context);
};
 
Game.prototype.update = function(){
	  var dt=Math.min((new Date().getTime() -this.t)/1000, 1); // temps, en segons, que ha passat des del darrer update
		this.t=new Date().getTime();
	
		this.paddle.update();    // Moviment de la raqueta
		this.ball.update(dt);    // moviment de la bola, depen del temps que ha passat

};


//////////////////////////////////////////////////////////////////////
// Comença el programa
var game;
$(document).ready(function(){
	$("#menu").show();
	$("#principal").hide();
	$("#gameMode").hide();
	$("#settings").hide();
	$("#instructions").hide();
	$("#game_over").hide();
});



function mainLoop(){

    game.update();
    game.draw();
		requestAnimationFrame(mainLoop);
}



///////////////////////////////////    Raqueta   //////////////////////////////////
function Paddle(){
    this.width = 150;
    this.height = 20;
		this.x = game.width/2 - this.width/2;
    this.y = game.height-50;
		this.vx = 10;
		this.color = "#0f0";
}

Paddle.prototype.update = function(){
		if (game.key.RIGHT.pressed) {        
      this.x = Math.min(game.width - this.width, this.x + this.vx);
    } 
		else if (game.key.LEFT.pressed) {   
      this.x = Math.max(0, this.x - this.vx);
    }
}

Paddle.prototype.draw = function(ctx){
	ctx.save();
	ctx.fillStyle=this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
	ctx.restore();
};




///////////////////////////////////    Pilota   //////////////////////////////////
function Ball(){
    this.x = 300; this.y = 400;         // posició del centre de la pilota
    this.vx = 300;  this.vy = 310;  // velocitat = 300 píxels per segon, cal evitar els 45 graus en el check!!
	this.radi = 10;                 // radi de la pilota
	this.color = "#333";  // gris fosc
}


//////////////////////////////////   Update Pilota   //////////////////////////////////
Ball.prototype.update = function(dt){

	if(game.start) {
		var dtXoc;      // temps empleat fins al xoc
		var xoc = false;  // si hi ha xoc en aquest dt
		var k;          // proporció de la trajectoria que supera al xoc
		var trajectoria = {};
		trajectoria.p1 = {x: this.x, y: this.y};


		////////////////////////////////////////////////////
		///	Progressive Difficulty - Survival Mode	  ///
		////////////////////////////////////////////////////
		/*
		 * Every 5 secons the ball's vertical speed increases.
		 * It starts adding +50 and each time adds half the previous amount.
		 * It also considerates wheter the ball is going down (+) or up (-)
		 *
		 * Every minute, the racket size is diminished by 10% of it's current width. After minute 5
		 * it is no longer reduced.
		 */

		if (game.mode == game.SURVIVAL_MODE) {

			// Racket's reduction
			if (Utilitats.temps % 60 == 0 && Utilitats.temps <= 300) {
				if (!Utilitats.lock) {
					var deltaWidth = game.paddle.width * 0.1;
					if (deltaWidth > 0) game.paddle.width -= deltaWidth;
					console.log("Paddle Reduced");
					Utilitats.lock = true;
				}
			}

			// Speed increase
			else if (Utilitats.temps % 5 == 0) {
				if (!Utilitats.lock) {
					var deltaVY = 50 / (Utilitats.temps * 0.2);
					if (this.vy > 0) this.vy += deltaVY;
					else this.vy -= deltaVY;
					console.log("Speed Increased");
					Utilitats.lock = true;
				}
			} else Utilitats.lock = false;

		}

		///////////////
		///   END   ///
		///////////////


////// Xocs Murs

//		var deltaX=this.vx*dt; 
//		var deltaY=this.vy*dt; 
		trajectoria.p2 = {x: this.x + this.vx * dt, y: this.y + this.vy * dt};  // nova posició de la bola

		// mirem tots els possibles xocs de la bola
		// Xoc amb la vora de sota de la pista
		if (trajectoria.p2.y + this.radi > game.height) {
			// hem perdut l'intent actual

			// en aquest exemple, rebotarem  
// mètode 1, des de p1 cap endavant
//		  k=(game.height-this.radi - trajectoria.p1.y)/deltaY;  // k sempre positiu
//		  // ens col·loquem just tocant la vora de sota  
//			this.x=trajectoria.p1.x+k*deltaX;
//			this.y=game.height-this.radi;
// 			dtXoc=(1-k)*dt;  // temps que queda

// mètode 2, des de p2 cap enrera		
//      k=(trajectoria.p2.y+this.radi - game.height)/deltaY;
//		  // ens col·loquem just tocant la vora de la dreta 
//			this.x=trajectoria.p2.x-k*deltaX; 
//			this.y=game.height-this.radi;
//      dtXoc=k*dt;  // temps que queda

// mètode 2, simplificat	sense les variables deltaX i deltaY			
			k = (trajectoria.p2.y + this.radi - game.height) / this.vy;
			// ens col·loquem just tocant la vora de la dreta
			this.x = trajectoria.p2.x - k * this.vx;
			this.y = game.height - this.radi;
			dtXoc = k * dt;  // temps que queda

			this.vy = -this.vy;
			xoc = true;
		}

		// Xoc amb la vora de dalt de la pista
		if (trajectoria.p2.y - this.radi < 0) {
			k = (trajectoria.p2.y - this.radi) / this.vy;  // k sempre positiu
			// ens col·loquem just tocant la vora de dalt
			this.x = trajectoria.p2.x - k * this.vx;
			this.y = this.radi;
			this.vy = -this.vy;
			dtXoc = k * dt;  // temps que queda
			xoc = true;
		}

		// Xoc amb la vora dreta de la pista
		if (trajectoria.p2.x + this.radi > game.width) {
			k = (trajectoria.p2.x + this.radi - game.width) / this.vx;
			// ens col·loquem just tocant la vora de la dreta
			this.x = game.width - this.radi;
			this.y = trajectoria.p2.y - k * this.vy;
			this.vx = -this.vx;
			dtXoc = k * dt;  // temps que queda
			xoc = true;
		}

		// Xoc amb la vora esquerra de la pista
		if (trajectoria.p2.x - this.radi < 0) {
			k = (trajectoria.p2.x - this.radi) / this.vx;  // k sempre positiu
			// ens col·loquem just tocant la vora de l'esquerra
			this.x = this.radi;
			this.y = trajectoria.p2.y - k * this.vy;
			this.vx = -this.vx;
			dtXoc = k * dt;  // temps que queda
			xoc = true;
		}


// END Xocs Murs


		var pXoc = Utilitats.interseccioSegmentRectangle(trajectoria, {
			p: {x: game.paddle.x - this.radi, y: game.paddle.y - this.radi},
			w: game.paddle.width + 2 * this.radi,
			h: game.paddle.height + 2 * this.radi
		});


		// Xoc mur inferior (-1 Life)

		if (this.y >= (game.canvas.height - game.paddle.height)) {
			game.loseCondition = true;
			console.log("Out of Bounds");
			// this.x=150;this.y=300;
			Utilitats.gameOver();
		}


		///////////////////////////
		//  Alteració velocitat  //
		///////////////////////////


		if (!game.naturalReflection) {
			if (pXoc) {
				this.vx = (((this.x - (game.paddle.x + (game.paddle.width / 2))) / (game.paddle.x + (game.paddle.width / 2))) * 1500);
			}
		}

		if (pXoc) {
			xoc = true;
			this.x = pXoc.p.x;
			this.y = pXoc.p.y;
			switch (pXoc.vora) {
				case "superior":
				case "inferior":
					this.vy = -this.vy;
					break;
				case "esquerra":
				case "dreta"   :
					this.vx = -this.vx;
					break;
			}
			dtXoc = (Utilitats.distancia(pXoc.p, trajectoria.p2) / Utilitats.distancia(trajectoria.p1, trajectoria.p2)) * dt;
		}

		/////////////////////////////
		//  Col·lisió dels totxos  //
		/////////////////////////////

		else {
			for (var i = 0; i < game.mur.totxos.length; i++) {
				if (!game.mur.totxos[i].tocat) {
					pXoc = Utilitats.interseccioSegmentRectangle(trajectoria, {
						p: {x: game.mur.totxos[i].x - this.radi, y: game.mur.totxos[i].y - this.radi},
						w: game.mur.totxos[i].w + 2 * this.radi,
						h: game.mur.totxos[i].h + 2 * this.radi
					});
				}
				if (pXoc) Utilitats.deleteBrick(i);
				if(pXoc && game.mode==game.SURVIVAL_MODE)game.mur.construir(1);
				if (pXoc) break;
			}
			if (pXoc) {
				xoc = true;
				this.x = pXoc.p.x;
				this.y = pXoc.p.y;
				switch (pXoc.vora) {
					case "superior":
					case "inferior":
						this.vy = -this.vy;
						break;
					case "esquerra":
					case "dreta"   :
						this.vx = -this.vx;
						break;
				}
				dtXoc = (Utilitats.distancia(pXoc.p, trajectoria.p2) / Utilitats.distancia(trajectoria.p1, trajectoria.p2)) * dt;
			}
		}


		// actualitzem la posició de la bola
		if (xoc) {
			this.update(dtXoc);  // crida recursiva
		}
		else {
			this.x = trajectoria.p2.x;
			this.y = trajectoria.p2.y;
		}


	}
};

Ball.prototype.draw = function(ctx){
	  ctx.save();
		ctx.fillStyle=this.color;
		ctx.beginPath();   
		ctx.arc(this.x, this.y, this.radi, 0, 2*Math.PI);   // pilota rodona
		ctx.fill();
		ctx.stroke();
		ctx.restore();
};



///////////////////////////////////    Totxo   //////////////////////////////////
function Totxo(x,y,color){
	this.x=x; this.y=y;         // posició, en píxels respecte el canvas
	this.w=game.AMPLADA_TOTXO; this.h=game.ALÇADA_TOTXO;         // mides
	this.color=color;
	this.tocat=false;
}

Totxo.prototype.draw = function(ctx){
	ctx.save();
	ctx.fillStyle=this.color;
	ctx.fillRect(this.x, this.y, this.w, this.h);
	ctx.strokeStyle="#333";
	ctx.strokeRect(this.x, this.y, this.w, this.h);
	ctx.restore();
};


///////////////////////////////////    Mur   //////////////////////////////////
function Mur(n){
	this.nivell=n;
	this.totxos=[];
}
Mur.prototype.construir=function (n) {
	this.nivell=n;
	var nivell=game.NIVELLS[n];

	if(game.mode!=game.SURVIVAL_MODE){
		for(var i=0; i<nivell.totxos.length;i++){
			var linia=nivell.totxos[i];
			for(var j=0; j<linia.length; j++){
				if(linia.charAt(j)!=" "){
					var totxo=new Totxo();
					totxo.x=j*game.AMPLADA_TOTXO;
					totxo.y=i*game.ALÇADA_TOTXO;
					totxo.color=nivell.colors[linia.charAt(j)];
					this.totxos.push(totxo);
				}
			}
		}
	}else{
		var totxo=new Totxo();
		totxo.x=Math.random()*10*game.AMPLADA_TOTXO;
		totxo.y=Math.random()*10*game.ALÇADA_TOTXO;
		totxo.color="#00D";
		this.totxos.push(totxo);
	}
}
Mur.prototype.draw = function(ctx){
	for(var i=0; this.totxos.length>i; i++){
		var totxo = this.totxos[i];
		if(!totxo.tocat)totxo.draw(ctx);
	}

}


//////////////////////////////////   Lectura de Nivells    //////////////////////////////////
Game.prototype.llegirNivells = function(){ //Index1
	this.NIVELLS = [
		{
			colors: {
				t: "#F77", // taronja
				c: "#4CF", // blue cel
				v: "#8D1", // verd
				e: "#D30", // vermell
				l: "#00D", // blau
				r: "#F7B", // rosa
				p: "#BBB" // plata
			},
			totxos: [
				"           ",
				"           ",
				" p         ",
				" ttttt     ",
				" ccccccc   ",
				" vvvvvvvvv ",
				" eeeeeeeee ",
				" lllllllll ",
				" r r r r r "
			]
		},
		{
			colors: {
				b: "#FFF", // blanc
				t: "#F77", // taronja
				c: "#4CF", // blue cel
				v: "#8D1", // verd
				e: "#D30", // vermell
				l: "#00D", // blau
				r: "#F7B", // rosa
				g: "#F93", // groc
				p: "#BBB", // plata
				d: "#FB4" // dorat
			},
			totxos: [
				"",
				" ddd ",
				" pppp ",
				" ttttt ",
				" cccccc ",
				" vvvvvvv ",
				" eeeeeeee ",
				" lllllllll ",
				" rrrrrrrrrr ",
				" ggggggggggg ",
				" bbbbbbbbbbbb ",
				" ddddddddddddd "
			]
		},
		{
			colors: {
				b: "#FFF", // blanc
				t: "#F77", // taronja
				c: "#4CF", // blue cel
				v: "#8D1", // verd
				e: "#D30", // vermell
				l: "#00D", // blau
				r: "#F7B", // rosa
				g: "#F93", // groc
				p: "#BBB", // plata
				d: "#FB4" // dorat
			},
			totxos: [
				"",
				"ddddddddddddddd ",
				"pppp       pppp ",
				"tttt       tttt ",
				"ccccccccccccccc ",
				"vvvv       vvvv ",
				"eeee       eeee ",
				"llll       llll ",
				"rrrrrrrrrrrrrrr ",
				"    ggggggg     ",
				"  bbbbbbbbbbb   ",
				"dddddddddddddddd"
			]
		}
	];
}



      //////////////////////////////////////////////////////////////////////////////
            //////////////////         Utilitats          /////////////////////
                 ///////////////////////////////////////////////////////

var Utilitats={};

this.temps;
this.lock=false;
var executeOnce=false;

Utilitats.randomLv = function(){
	return Math.floor((Math.random() * 2)+1);
}

Utilitats.deleteBrick = function(index){
	game.broken++;
	console.log("Totxos destruits: "+game.broken+"/"+(game.mur.totxos.length-1));
	game.mur.totxos[index].tocat=true;
	if(game.broken>=(game.mur.totxos.length-1)) Utilitats.levelCompleted();
}

Utilitats.levelCompleted = function(){
	if(game.mode==game.NORMAL_MODE){
		game.currentLv++;
		game.inicialitzar(game.currentLv);
	}
	else if(game.mode==game.TIMED_MODE){
		game.currentLv=Utilitats.randomLv();
		game.inicialitzar(game.currentLv);
	}
	game.broken=0;
}

Utilitats.gameOver = function(){
	console.log("Game Over");
}

  //////////////////////////////////////
 ///	INTERSECCIONS - NO TOCAR	///
//////////////////////////////////////


Utilitats.esTallen = function(p1,p2,p3,p4){
	function check(p1,p2,p3){
		return (p2.y-p1.y)*(p3.x-p1.x) < (p3.y-p1.y)*(p2.x-p1.x);
	}
	return check(p1,p2,p3) != check(p1,p2,p4) && check(p1,p3,p4) != check(p2,p3,p4);
}

// si retorna undefined és que no es tallen
Utilitats.puntInterseccio2 = function(p1,p2,p3,p4){
	var A1, B1, C1, A2, B2, C2, x, y, d;
	if(Utilitats.esTallen(p1,p2,p3,p4)){
		A1=p2.y-p1.y; B1=p1.x-p2.x; C1=p1.x*p2.y-p2.x*p1.y;
		A2=p4.y-p3.y; B2=p3.x-p4.x; C2=p3.x*p4.y-p4.x*p3.y;
		d=A1*B2-A2*B1;
		if(d!=0){
	    x=(C1*B2-C2*B1)/d; 
		  y= (A1*C2-A2*C1)/d;
		  return {x:x, y:y};
		}
	}
}

Utilitats.puntInterseccio=function (p1,p2,p3,p4){
	// converteix segment1 a la forma general de recta: Ax+By = C
	var a1 = p2.y - p1.y;
	var b1 = p1.x - p2.x;
	var c1 = a1 * p1.x + b1 * p1.y;
	
	// converteix segment2 a la forma general de recta: Ax+By = C
	var a2 = p4.y - p3.y;
	var b2 = p3.x - p4.x;
	var c2 = a2 * p3.x + b2 * p3.y;
	
	// calculem el punt intersecció		
	var d = a1*b2 - a2*b1;
	
	// línies paral·leles quan d és 0
	if (d == 0) {
		return false;
	}
	else {
		var x = (b2*c1 - b1*c2) / d;
		var y = (a1*c2 - a2*c1) / d;
		var puntInterseccio={x:x, y:y};	// aquest punt pertany a les dues rectes	
  	if(Utilitats.contePunt(p1,p2,puntInterseccio) && Utilitats.contePunt(p3,p4,puntInterseccio) )
		   return puntInterseccio;
	}
}

Utilitats.contePunt=function(p1,p2, punt){
	return (valorDinsInterval(p1.x, punt.x, p2.x) || valorDinsInterval(p1.y, punt.y, p2.y)); 
	
	// funció interna
	function valorDinsInterval(a, b, c) {  
	  // retorna cert si b està entre a i b, ambdos exclosos
	  if (Math.abs(a-b) < 0.000001 || Math.abs(b-c) < 0.000001) { // no podem fer a==b amb valors reals!!
		  return false;
	  }
  	return (a < b && b < c) || (c < b && b < a);
  }
}


Utilitats.distancia = function(p1,p2){
	return Math.sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y));
}

Utilitats.interseccioSegmentRectangle = function(seg,rect){  // seg={p1:{x:,y:},p2:{x:,y:}}
                                                             // rect={p:{x:,y:},w:,h:}
		var pI, dI, pImin, dImin=Infinity, vora;
		// vora superior
		pI=Utilitats.puntInterseccio(seg.p1, seg.p2, 
															{x:rect.p.x,y:rect.p.y}, {x:rect.p.x+rect.w, y:rect.p.y}); 
		if(pI){
			dI=Utilitats.distancia(seg.p1, pI);
			if(dI<dImin){
				dImin=dI;
				pImin=pI;
				vora="superior";
			}
		}
		// vora inferior
		pI=Utilitats.puntInterseccio(seg.p1, seg.p2, 
															 {x:rect.p.x+rect.w, y:rect.p.y+rect.h},{x:rect.p.x, y:rect.p.y+rect.h}); 
		if(pI){
			dI=Utilitats.distancia(seg.p1, pI);
			if(dI<dImin){
				dImin=dI;
				pImin=pI;
				vora="inferior";
			}
		}

		// vora esquerra
		pI=Utilitats.puntInterseccio(seg.p1, seg.p2, 
															  {x:rect.p.x, y:rect.p.y+rect.h},{x:rect.p.x,y:rect.p.y}); 
		if(pI){
			dI=Utilitats.distancia(seg.p1, pI);
			if(dI<dImin){
				dImin=dI;
				pImin=pI;
				vora="esquerra";
			}
		}
		// vora dreta
		pI=Utilitats.puntInterseccio(seg.p1, seg.p2, 
															 {x:rect.p.x+rect.w, y:rect.p.y}, {x:rect.p.x+rect.w, y:rect.p.y+rect.h});
		if(pI){
			dI=Utilitats.distancia(seg.p1, pI);
			if(dI<dImin){
				dImin=dI;
				pImin=pI;
				vora="dreta";
			}
		}
				
		if(vora){
			return {p:pImin,vora:vora}
		}
	
}





            //////////////////////////////////////////////////////////////////////////////
                //////////////////         Interface          /////////////////////
                      ///////////////////////////////////////////////////////




function gameStart(mode,level){


	if(mode==1) {
		$("#logo").hide();
		$("#rellotge").show();
		$("#principal").css("background-image", "url(./data/BG.timed.jpg");
	}
	else if(mode==2) {
		$("#logo").hide();
		$("#rellotge").show();
		$("#principal").css("background-image", "url(./data/BG.survival.jpg");
	}
	else{
	 $("#principal").css("background-image", "url(./data/BG.normal.jpg");
	}


	game= new Game(mode,level);  
	game.inicialitzar(level);
	if(!Utilitats.executeOnce)setInterval(game.rellotge,1000); //cada 1 segon executa la funcio rellotge
	Utilitats.executeOnce=true;
	game.naturalReflection=$('#naturalReflection').get(0).checked;
}


$("#new_game").click(function(e) {

	$("#gameMode").show("slide");
	$("#main").hide(400);
});

$("#back_gameMode").click(function(e) {

	$("#main").show(400);
	$("#gameMode").hide("slide");

	
});

$("#normal").click(function(e) {

	$("#menu").hide();
	$("#principal").show("puff",0,1000);
	$("#game_over").hide();
	$("#game").hide();

});

$("#timed").click(function(e) {

	gameStart(1,0);

	$("#menu").hide();
	$("#principal").show("puff",0,1000);


});

$("#survival").click(function(e) {

	gameStart(2,1);

	$("#menu").hide();
	$("#principal").show("puff",0,1000);

});

$("#instructionsButton").click(function(e) {


	$("#instructions").show("slide");
	$("#main").hide(400);

});

$("#back_instructions").click(function(e) {

	$("#main").show(400);
	$("#instructions").hide("slide");


});

$("#settingsButton").click(function(e) {


	$("#settings").show("slide");
	$("#main").hide(400);

});

$("#back_settings").click(function(e) {

	$("#main").show(400);
	$("#settings").hide("slide");


});

$("#back_canvas").click(function(e) {
	$("#menu").show(400);
	$("#gameMode").show("slide");
	$("#game_over").hide("slide");
	$("#principal").hide("slide");
	$("#rellotge").hide();
	game.start=false;

});

$("#levelSelector").change(function(e) {
	if($("#levelSelector").val()==0){
		$("#game").hide("puff", 0, 1000);
	}
	else {
		gameStart(0, ($("#levelSelector").val() - 1));
		$("#game").show("slide", 0, 2000);
	}
});

$("#back_game_over").click(function(e) {


});
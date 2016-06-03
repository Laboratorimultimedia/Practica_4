///////////////////////////////////    Objecte game
function Game(){
	this.AMPLADA_TOTXO=50; this.ALÇADA_TOTXO=25; // MIDES DEL TOTXO EN PÍXELS
	this.canvas,  this.context;       // context per poder dibuixar en el Canvas
  this.width, this.height;          // mides del canvas
				
	this.paddle;   // la raqueta
  this.ball;     // la pilota
	this.totxo;


	  ////////////////////////
     //  Global Variables  //
    ////////////////////////
	this.t=0;      // el temps
    this.loseCondition=false;
				
	// Events del teclat
	this.key={
		 RIGHT:{code: 39, pressed:false}, 
		 LEFT :{code: 37, pressed:false}
	};

}

Game.prototype.inicialitzar = function(){
		this.canvas = document.getElementById("game");
    this.width = this.AMPLADA_TOTXO*15;  // 15 totxos com a màxim d'amplada
		this.canvas.width = this.width;
    this.height = this.ALÇADA_TOTXO*25;
		this.canvas.height =this.height;
    this.context = this.canvas.getContext("2d");
			
    this.paddle = new Paddle();
    this.ball = new Ball();
		this.totxo= new Totxo(200,200,400,200,"#bbf");

			
		// Events amb jQuery
		$(document).on("keydown", {game:this},function(e) {
				if(e.keyCode==e.data.game.key.RIGHT.code){ 
				  e.data.game.key.RIGHT.pressed = true;
				}
				else if(e.keyCode==e.data.game.key.LEFT.code){ 
				  e.data.game.key.LEFT.pressed = true;
				}
    });
		$(document).on("keyup", {game:this},function(e) {
				if(e.keyCode==e.data.game.key.RIGHT.code){ 
				  e.data.game.key.RIGHT.pressed = false;
				}
				else if(e.keyCode==e.data.game.key.LEFT.code){ 
				  e.data.game.key.LEFT.pressed = false;
				}
    });
			
		this.t=new Date().getTime();     // inicialitzem el temps
	  requestAnimationFrame(mainLoop);	
}

Game.prototype.draw = function(){
	 
   this.context.clearRect(0, 0, this.width, this.height);
		
    this.totxo.draw(this.context);
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
	game= new Game();  	   // Inicialitzem la instància del joc
  game.inicialitzar();   // estat inicial del joc
	
});

function mainLoop(){

    game.update();
    game.draw();
		requestAnimationFrame(mainLoop);

}



///////////////////////////////////    Raqueta
function Paddle(){
    this.width = 300;
    this.height = 20;
		this.x = game.width/2 - this.width/2;
    this.y = game.height-50;
		this.vx = 10;
		this.color = "#fbb"; // vermell
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


///////////////////////////////////    Pilota
function Ball(){
    this.x = 0; this.y = 0;         // posició del centre de la pilota
    this.vx = 300;  this.vy = 310;  // velocitat = 300 píxels per segon, cal evitar els 45 graus en el check!!
	  this.radi = 10;                 // radi de la pilota
	  this.color = "#333";  // gris fosc
}

Ball.prototype.update = function(dt){
	  var dtXoc;      // temps empleat fins al xoc
		var xoc=false;  // si hi ha xoc en aquest dt
		var k;          // proporció de la trajectoria que supera al xoc
		var trajectoria={};
		trajectoria.p1={x:this.x, y:this.y};
//		var deltaX=this.vx*dt; 
//		var deltaY=this.vy*dt; 
		trajectoria.p2={x:this.x + this.vx*dt, y:this.y + this.vy*dt};  // nova posició de la bola

		// mirem tots els possibles xocs de la bola
    // Xoc amb la vora de sota de la pista
    if (trajectoria.p2.y + this.radi > game.height){    
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
		  k=(trajectoria.p2.y+this.radi - game.height)/this.vy;  
	    // ens col·loquem just tocant la vora de la dreta  
		  this.x=trajectoria.p2.x-k*this.vx;
		  this.y=game.height-this.radi;
      dtXoc=k*dt;  // temps que queda
			
      this.vy = -this.vy;
			xoc=true;
		}
		
		// Xoc amb la vora de dalt de la pista
    if (trajectoria.p2.y - this.radi < 0){   
	  	k=(trajectoria.p2.y-this.radi)/this.vy;  // k sempre positiu
		  // ens col·loquem just tocant la vora de dalt   
			this.x=trajectoria.p2.x-k*this.vx;
			this.y=this.radi;
      this.vy = -this.vy;
			dtXoc=k*dt;  // temps que queda
			xoc=true;
		}
    
    // Xoc amb la vora dreta de la pista
    if (trajectoria.p2.x + this.radi > game.width){      
		  k=(trajectoria.p2.x+this.radi - game.width)/this.vx;
		  // ens col·loquem just tocant la vora de la dreta  
			this.x=game.width-this.radi;
			this.y=trajectoria.p2.y-k*this.vy;
      this.vx = -this.vx;
			dtXoc=k*dt;  // temps que queda
			xoc=true;
		}
		
		// Xoc amb la vora esquerra de la pista
    if (trajectoria.p2.x - this.radi< 0){   
	  	k=(trajectoria.p2.x-this.radi)/this.vx;  // k sempre positiu
		  // ens col·loquem just tocant la vora de l'esquerra  
			this.x=this.radi; 			
			this.y=trajectoria.p2.y-k*this.vy;
      this.vx = -this.vx;
			dtXoc=k*dt;  // temps que queda
			xoc=true;
		}

		
    // Xoc amb la raqueta
    var pXoc=Utilitats.interseccioSegmentRectangle(trajectoria, {
        p: {x:game.paddle.x-this.radi,y:game.paddle.y-this.radi},
        w:game.paddle.width+2*this.radi,
        h:game.paddle.height+2*this.radi});

    // Xoc amb el mur

if(this.y>=(game.canvas.height-game.paddle.height)){
    game.loseCondition=true;
    console.log("Out of Bounds");
}



      ///////////////////////////
     //  Alteració velocitat  //
    ///////////////////////////

    // Todo: Adjust left-half-to-right reflection (currently left-half to left)
    if(pXoc){
        this.vx=100+(((this.x-(game.paddle.x + 150))/(game.paddle.x + 150))*1000);
    }


    // xoc amb un totxo
    else {
        pXoc = Utilitats.interseccioSegmentRectangle(trajectoria, {
            p: {x: game.totxo.x - this.radi, y: game.totxo.y - this.radi},
            w: game.totxo.w + 2 * this.radi,
            h: game.totxo.h + 2 * this.radi
        });
    }

	  if(pXoc){
			xoc=true;
			this.x=pXoc.p.x; 			
			this.y=pXoc.p.y;
			switch(pXoc.vora){
				case "superior":
				case "inferior":  this.vy = -this.vy; break;
				case "esquerra":
				case "dreta"   :  this.vx = -this.vx; break;
			}
			dtXoc=(Utilitats.distancia(pXoc.p,trajectoria.p2)/Utilitats.distancia(trajectoria.p1,trajectoria.p2))*dt;
		}






    // actualitzem la posició de la bola
		if(xoc){
			this.update(dtXoc);  // crida recursiva
		}
		else{
			this.x=trajectoria.p2.x; 			
			this.y=trajectoria.p2.y;
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

///////////////////////////////////    Totxo
function Totxo(x,y,w,h,color){
		this.x=x; this.y=y;         // posició, en píxels respecte el canvas
		this.w=w; this.h=h;         // mides
		this.color=color;
}
 
Totxo.prototype.draw = function(ctx){
		ctx.save();
		ctx.fillStyle=this.color;
		ctx.fillRect(this.x, this.y, this.w, this.h);
		ctx.strokeStyle="#333";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		ctx.restore();	
};


//////////////////////////////////////////////////////////////////////
// Utilitats
var Utilitats={};
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






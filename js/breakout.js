///////////////////////////////////    Objecte game
function Game(){
	this.AMPLADA_TOTXO=50; this.ALÇADA_TOTXO=25; // MIDES DEL TOTXO EN PÍXELS
	this.NIVELLS;
	this.nivellActual=1;
	
	this.canvas,       this.context;                      // context per poder dibuixar en el Canvas
	
  this.width, this.height;
				
	this.paddle;
  this.ball;
		
	this.t=0;    // el temps
				
	// Events del teclat
	this.key={RIGHT:{code: 39, pressed:false}, LEFT:{code:37, pressed:false}};

}

Game.prototype.inicialitzar = function(){
		this.canvas = document.getElementById("game");
    this.width = this.AMPLADA_TOTXO*15;  // 15 totxos com a màxim d'amplada
		this.canvas.width = this.width;
    this.height = this.ALÇADA_TOTXO*25;
		this.canvas.height =this.height;
    this.context = this.canvas.getContext("2d");
			
    this.paddle = new Paddle(this.width/2-50, this.height-50);
    this.ball = new Ball();
			
		// Events amb jQuery
		$(document).on("keydown", {game:this},function(e) {
				if(e.keyCode==e.data.game.key.RIGHT.code) 
				  e.data.game.key.RIGHT.pressed = true;
				else if(e.keyCode==e.data.game.key.LEFT.code) 
				  e.data.game.key.LEFT.pressed = true;
    });
		$(document).on("keyup", {game:this},function(e) {
				if(e.keyCode==e.data.game.key.RIGHT.code) 
				  e.data.game.key.RIGHT.pressed = false;
				else if(e.keyCode==e.data.game.key.LEFT.code) 
				  e.data.game.key.LEFT.pressed = false;
    });
			
		this.t=new Date().getTime(); // inicialitzem el temps
	  requestAnimationFrame(mainLoop);	
}

Game.prototype.draw = function(){
    this.context.clearRect(0, 0, this.width, this.height);
		
    this.paddle.draw(this.context);
    this.ball.draw(this.context);
};
 
Game.prototype.update = function(){
	  var dt=Math.min((new Date().getTime() -this.t)/1000, 1); // temps, en segons, que ha passat des del darrer update
		this.t=new Date().getTime();
		
    // Moviment de la raqueta
		this.paddle.update();
    // moviment de la bola
		this.ball.update(dt);

};


//////////////////////////////////////////////////////////////////////
// Comença el programa
var game;
$(document).ready(function(){
	// Inicialitzem la instància del joc
	game= new Game(); 
  game.inicialitzar();
	
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
    this.x = 0; this.y = 0;
    this.vx = 300;  this.vy = 300; // velocitat = 300 píxels per segon
    this.width = 20;               // pilota quadrada
    this.height = this.width;   
	  this.radi = this.width/2;   // pilota rodona
	  this.color = "#333";  // blau
}

Ball.prototype.update = function(dt){
	  var dtXoc;      // temps empleat fins al xoc
		var xoc=false;  // si hi ha xoc en aquest dt
		var k;          // proporció de la trajectoria que supera al xoc
		var trajectoria={};
		trajectoria.p1={x:this.x, y:this.y};
		trajectoria.p2={x:this.x + this.vx*dt, y:this.y + this.vy*dt};  // nova posició de la bola
		// mirem tots els possibles xocs de la bola
    // Xoc amb la vora de sota de la pista
    if (trajectoria.p2.y + this.radi > game.height){    
		  // hem perdut l'intent actual
			
			// en aquest exemple, rebotarem  
		  k=(trajectoria.p2.y - game.height)/this.vy;
		  // ens col·loquem just tocant la vora de sota  
			this.x=trajectoria.p2.x-k;
			this.y=game.height-this.radi-1;
      this.vy = -this.vy;
			dtXoc=k*dt;  // temps que queda
			xoc=true;
		}
		
		// Xoc amb la vora de dalt de la pista
    if (trajectoria.p2.y - this.radi < 0){   
	  	k=(-trajectoria.p2.y)/this.vy;  // k sempre positiu
		  // ens col·loquem just tocant la vora de dalt   
			this.x=trajectoria.p2.x-k;
			this.y=this.radi+1;
      this.vy = -this.vy;
			dtXoc=k*dt;  // temps que queda
			xoc=true;
		}
    
    // Xoc amb la vora dreta de la pista
    if (trajectoria.p2.x + this.radi > game.width){      
		  k=(this.x - game.width)/this.vx;
		  // ens col·loquem just tocant la vora de la dreta  
			this.x=game.width-this.radi-1;
			this.y=trajectoria.p2.y-k;
      this.vx = -this.vx;
			dtXoc=k*dt;  // temps que queda
			xoc=true;
		}
		
		// Xoc amb la vora esquerra de la pista
    if (trajectoria.p2.x - this.radi< 0){   
	  	k=(-trajectoria.p2.x)/this.vx;  // k sempre positiu
		  // ens col·loquem just tocant la vora de l'esquerra  
			this.x=this.radi+1; 			
			this.y=trajectoria.p2.y-k;
      this.vx = -this.vx;
			dtXoc=k*dt;  // temps que queda
			xoc=true;
		}
		
		
		// Xoc amb la raqueta
    var pXoc=Utilitats.interseccioSegmentRectangle(trajectoria,{p:{x:game.paddle.x-this.radi,y:game.paddle.y-this.radi},
                                                                w:game.paddle.width+2*this.radi,
																																h:game.paddle.height+2*this.radi});
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

    // Xoc amb el mur





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
Utilitats.puntInterseccio = function(p1,p2,p3,p4){
	var A1, B1, C1, A2, B2, C2, x, y, d;
	if(Utilitats.esTallen(p1,p2,p3,p4)){
		A1=p2.y-p1.y; B1=p1.x-p2.x; C1=p1.x*p2.y-p2.x*p1.y;
		A2=p4.y-p3.y; B2=p3.x-p4.x; C2=p3.x*p4.y-p4.x*p3.y;
		d=A1*B2-A2*B1;
	  x=(C1*B2-C2*B1)/d; 
		y= (A1*C2-A2*C1)/d;
		return {x:x, y:y};
	}
}

Utilitats.distancia = function(p1,p2){
	return Math.sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y));
}

Utilitats.interseccioSegmentRectangle = function(seg,rect){  // seg={p1:{x:,y:},p2:{x:,y:}}rect={p:{x:,y:},w:,h:}
	
}



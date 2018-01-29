/**
 * This is the original script stored in example_draw.html
 */

var test=function(){
    
    var numBands = 60;
    var maxMass = 10.0;
    var minMass = 1.0;
    var minLaxBandDistance = 10.0;
    var maxLaxBandDistance = 50.0;
    var minBandStrength = 5.0;
    var maxBandStrength = 10.0;
    var collisionDistance = 10.0;
    var distanceMaxToCenter = 55;
    var distanceMinToCenter = 45;
    var blobCenter = new jssim.Space2D(300,300);


    
    var Band = function(laxDistance, strength) {
	this.laxDistance = laxDistance;
	this.strength = strength;
    };

    var Boid = function(id, initial_x, initial_y, space, isPredator, bands) {
        var rank = 1;
        jssim.SimEvent.call(this, rank);
        this.id = id;
        this.space = space;
        this.space.updateAgent(this, initial_x, initial_y);
        this.sight = 75;
        this.speed = 1;
        this.separation_space = distanceMaxToCenter;
        this.velocity = new jssim.Vector2D(Math.random(), Math.random());
        this.isPredator = isPredator;
        this.border = 1;
        this.boundary = 640;
        this.size = new jssim.Vector2D(5, 5);
        this.color = '#00ff00';
        if(isPredator){
            this.color = '#eeff00';
            this.size = new jssim.Vector2D(8, 8);
	    this.bands = bands;
        }
        else{
            this.space.updateAgent(this, initial_x+Math.random()*100, initial_y+Math.random()*100);
	    
        }


	this.collision = false;
    };
    
    
    
    Boid.prototype = Object.create(jssim.SimEvent);
    Boid.prototype.update = function(deltaTime) {
        var boids = this.space.findAllAgents();
        var pos = this.space.getLocation(this.id);
        // Bidouillage pour calculer le nouveau centre
        var new_center = new jssim.Space2D();
        var count = 0;
        for (var boidId in boids) {
            count++;
            new_center += this.space.getLocation(boidId);
        }
        blobCenter = new_center / count;
        var distance_to_center = pos.distance(blobCenter);
        if (distance_to_center > distanceMaxToCenter)
        {
            //attraction to the center 
            this.velocity.x += (blobCenter.x - pos.x) * (distance_to_center);
            this.velocity.y += (blobCenter.y - pos.y) * (distance_to_center);
        } else {
            if (distance_to_center < distanceMinToCenter)
            {
                //get out of the center
                this.velocity.x += (pos.x - boid_pos.x) * ((1/(distance_to_center+1))*50*count);
                this.velocity.y += (pos.y - boid_pos.y) * ((1/(distance_to_center+1))*50*count);
            }
        }
        // Fin bidouillage
        if(this.isPredator) {
            var prey = null;
            var min_distance = 1000000;
            for (var boidId in boids)
            {
                var boid = boids[boidId];
                if(!boid.isPredator) {
                    var boid_pos = this.space.getLocation(boid.id);
                    var distance = pos.distance(boid_pos);
                    if(min_distance > distance){
                        min_distance = distance;
                        prey = boid;
                    }
                } else {
                    var boid_pos = this.space.getLocation(boid.id);
                    var distance = pos.distance(boid_pos);
		    this.laxDistance = 10;
                    this.strength = 0.5;
                    if (distance < this.separation_space)
                    {
                        // Separation
                        this.velocity.x += (pos.x - boid_pos.x)* (1/(distance+1))*2;
                        this.velocity.y += (pos.y - boid_pos.y)* (1/(distance+1))*2;
                    }
                    else {
                        if (distance > this.separation_space)
                        {
                            //attraction
                            this.velocity.x += (boid_pos.x - pos.x)* (distance+1)*2;// - boid_pos.x;
                            this.velocity.y += (boid_pos.y - pos.y)* (distance+1)*2;// - boid_pos.y;
                        }
                    }
                }
            }
            if(prey != null) {
                var prey_position = this.space.getLocation(prey.id);
                var distance_to_prey = pos.distance(prey_position);
                this.velocity.x += (prey_position.x - pos.x)*2/(1+distance_to_prey/2);
                this.velocity.y += (prey_position.y - pos.y)*2/(1+distance_to_prey/2);
            } 
            
        }  else {
            /** deactivate flight response and movement for "prey" blobs.
	    for (var boidId in boids)
            {
                var boid = boids[boidId];
                var boid_pos = this.space.getLocation(boid.id);
                var distance = pos.distance(boid_pos);
                if (boid != this && !boid.isPredator)
                {
                    if (distance < this.separation_space)
                    {
                        // Separation
                        this.velocity.x += pos.x - boid_pos.x;
                        this.velocity.y += pos.y - boid_pos.y;
                    }
                    else if (distance < this.sight)
                    {
                        // Cohesion
                        this.velocity.x += (boid_pos.x - pos.x) * 0.05;
                        this.velocity.y += (boid_pos.y - pos.y) * 0.05;
                    }
                    if (distance < this.sight)
                    {
                        // Alignment
                        this.velocity.x += boid.velocity.x * 0.5;
                        this.velocity.y += boid.velocity.y * 0.5;
                    }
                }
                if (boid.isPredator && distance < this.sight)
                {
                    // Avoid predators.
                    this.velocity.x += pos.x - boid_pos.x;
                    this.velocity.y += pos.y - boid_pos.y;
                }
            }
	    */
	    this.velocity.x = 0;
	    this.velocity.y = 0;
        }



	
        // check speed
        var speed = this.velocity.length();
        if(speed > this.speed) {
            this.velocity.resize(this.speed);
        }
        
	
        pos.x += this.velocity.x;
        pos.y += this.velocity.y;
	
	
	
        // check boundary
        var val = this.boundary - this.border;
        if (pos.x < this.border) pos.x = this.boundary - this.border;
        if (pos.y < this.border) pos.y = this.boundary - this.border;
        if (pos.x > val) pos.x = this.border;
        if (pos.y > val) pos.y = this.border;
        //console.log("boid [ " + this.id + "] is at (" + pos.x + ", " + pos.y + ") at time " + this.time);
    };
    
    //
    Boid.prototype.draw = function(context, pos) {
        context.fillStyle="#000000";
        var size = 1;
        
        //context.fillRect(pos.x, worldHeight - pos.y, width, height);
        context.beginPath();
	context.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
        context.fill();
	
	context.fillStyle = '#ffffff';
	
	//context.font = "12 Arial";
	//context.fillText("" + this.id,pos.x, pos.y);
    };
    //
    
    
    
    var scheduler = new jssim.Scheduler();
    scheduler.reset();
    var space = new jssim.Space2D();
    space.reset();
    numBoids = 150;

    var bands = new jssim.Network(numBoids);
    space.network = bands;
    
    for (var i = 0; i < numBoids; i++) {
        var is_predator = i > 3;
	var startX = 450;
	var startY = 450;
	
	if (is_predator) {
	    startX = 300;
	    startY = 300;
	    
	}
        var boid = new Boid(i, startX, startY, space, is_predator);
	//if (i == 10){boid.speed = 0;}
	
	var laxDistance = 10;
	var strength = 1;
	if (i > 4){
	    for (j=4; j < i; j++){
		
		var band = new Band(laxDistance, strength);
		//bands.addEdge(new jssim.Edge(j,i,band));
	    }
	}
        scheduler.scheduleRepeatingIn(boid, 1);
    }
    
    
    
    
    var canvas = document.getElementById("myCanvas");
    setInterval(function(){ 
        scheduler.update();

        space.render(canvas);
        console.log('current simulation time: ' + scheduler.current_time);
        document.getElementById("simTime").value = "Simulation Time: " + scheduler.current_time;
    }, 100);
};
test();

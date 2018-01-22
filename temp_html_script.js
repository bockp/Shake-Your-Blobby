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
        this.speed = 3;
        this.separation_space = 50;
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
        if(this.isPredator) {
            var prey = null;
            var min_distance = 10000000;
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
                        this.velocity.x += pos.x - boid_pos.x;
                        this.velocity.y += pos.y - boid_pos.y;
                    }
                    else {
                        if (distance > this.separation_space*2)
                        {
                            //attraction
                            this.velocity.x -= pos.x - boid_pos.x;
                            this.velocity.y -= pos.y - boid_pos.y;
                        }
                    }
                }
            }
            if(prey != null) {
                var prey_position = this.space.getLocation(prey.id);
                this.velocity.x += prey_position.x - pos.x;
                this.velocity.y += prey_position.y - pos.y;
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



	Boid.prototype.computeCollision = function() {
            var me = this.space.getLocation(this.id);
            var bag = this.space.getNeighborsWithinDistance(me, collisionDistance);
            this.collision = bag.length > 1;  // other than myself of course  
        };


	
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
    
    
    
    
    

    
    var scheduler = new jssim.Scheduler();
    scheduler.reset();
    var space = new jssim.Space2D();
    space.reset();
    numBoids = 50;

    var bands = new jssim.Network(numBoids);
    space.network = bands;
    
    for(var i = 0; i < numBoids; ++i) {
        var is_predator = i > 3;
	startX = 500
	startY = 500
	from = 3
	if(is_predator){    // faut trouver comment faire pour que
	    // A: uniquement les "predateur" blobls sont connectée par des liens et
	    // B: ces liens s'effacent au cours du temps. la ils se dessinent de maniere PERMANENTE sur le canvas.
	    //to = i
	    startX = 300;
	    startY = 300;
	    
	    //bands.addEdge(new jssim.Edge(from,to,band));
	    //from = to
	}
        var boid = new Boid(i, startX, startY, space, is_predator);
        scheduler.scheduleRepeatingIn(boid, 1);
    }


    // bands
/**
    for(var i=3;i<numBoids;i++)
    {
        var laxDistance = 10;
        var strength = 1;
        var band = new Band(laxDistance, strength);
        var from = Math.floor(Math.random() * numBoids );
        var to = from;
        while(to == from) {
            to = from + 1;

        }
        bands.addEdge(new jssim.Edge(from,to,band));
    }
*/
    
    
    
    
    var canvas = document.getElementById("myCanvas");
    setInterval(function(){ 
        scheduler.update();

        space.render(canvas);
        console.log('current simulation time: ' + scheduler.current_time);
        document.getElementById("simTime").value = "Simulation Time: " + scheduler.current_time;
    }, 100);
};
test();

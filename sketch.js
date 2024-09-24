const API_KEY = "e9082b3cd0d8b3f8cb1bc6860b327285"; 
const CITY = "Ha Noi";             
const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}`;

let mapimg;
let clat = 0;
let clon = 0;
let ww = 1024;
let hh = 512;
let zoom = 1;
let earthquakes;


let windData = [];
const numParticles = 500; 
let particleSpeed = 0.2; 

let url =
  "https://api.mapbox.com/styles/v1/mapbox/dark-v9/static/" +
  clon +
  "," +
  clat +
  "," +
  zoom +
  "/" +
  ww +
  "x" +
  hh +
  "?access_token=" +
  "pk.eyJ1Ijoia292MXp6IiwiYSI6ImNtMWcxcHE2MTBkNzYyaXE0NmcxdGFhcHcifQ.YVB_BjHF-GrN5YXMHGKLuw";

function preload() {
  mapimg = loadImage(url);
  earthquakes = loadStrings(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.csv"
  );
}

function mercatorX(lon) {
  lon = radians(lon);
  let a = (256 / PI) * pow(2, zoom);
  let b = lon + PI;
  return a * b;
}

function mercatorY(lat) {
  lat = radians(lat);
  let a = (256 / PI) * pow(2, zoom);
  let b = tan(PI / 4 + lat / 2);
  let c = PI - log(b);
  return a * c;
}

function setup() {
  createCanvas(ww, hh);
  let cx = mercatorX(clon);
  let cy = mercatorY(clat);

  for (let i = 0; i < numParticles; i++) {
    windData.push({
      x: random(-width / 2, width / 2), 
      y: random(-height / 2, height / 2), 
      vx: random(-0.5, 0.5), 
      vy: random(-0.5, 0.5), 
    });
  }


  imageMode(CENTER);
  image(mapimg, width / 2, height / 2);

  for (let i = 1; i < earthquakes.length; i++) {
    let data = earthquakes[i].split(/,/);
    let lat = data[1];
    let lon = data[2];
    let mag = data[4];
    let x = mercatorX(lon) - cx;  
    let y = mercatorY(lat) - cy;

    if (x < -width / 2) {
      x += width;
    } else if (x > width / 2) {
      x -= width;
    }

    mag = pow(10, mag);
    mag = sqrt(mag);
    let magmax = sqrt(pow(10, 10));
    let d = map(mag, 0, magmax, 0, 180);
    stroke(236, 141, 46);
    fill(255, 0, 255, 200);
    circle(x + width / 2, y + height / 2, d); 
  }
}

function draw() {
  image(mapimg, width / 2, height / 2);
  drawEarthquakeMarkers(); 
  drawParticles(); 
}

function drawEarthquakeMarkers() {
  let cx = mercatorX(clon);
  let cy = mercatorY(clat);
  for (let i = 1; i < earthquakes.length; i++) {
    let data = earthquakes[i].split(/,/);
    let lat = data[1];
    let lon = data[2];
    let mag = data[4];
    let x = mercatorX(lon) - cx;  
    let y = mercatorY(lat) - cy;


    if (x < -width / 2) {
      x += width;
    } else if (x > width / 2) {
      x -= width;
    }

    mag = pow(10, mag);
    mag = sqrt(mag);
    let magmax = sqrt(pow(10, 10));
    let d = map(mag, 0, magmax, 0, 180);
    stroke(236, 141, 46);
    fill(255, 0, 255, 200);
    circle(x + width / 2, y + height / 2, d); 
  }
}

function drawParticles() {
  for (let particle of windData) {
    particle.x += particle.vx * particleSpeed;
    particle.y += particle.vy * particleSpeed;


    if (particle.x > width / 2) particle.x = -width / 2;
    if (particle.x < -width / 2) particle.x = width / 2;
    if (particle.y > height / 2) particle.y = -height / 2;
    if (particle.y < -height / 2) particle.y = height / 2;

   
    fill(255, 255, 255, 100); 
    noStroke();
    ellipse(particle.x + width / 2, particle.y + height / 2, 4, 4); 
  }
}

async function fetchWindData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch wind data");

        const data = await response.json();
        console.log("API Data:", data); 
        
        const windSpeed = data.wind.speed; 
        const windDirection = data.wind.deg; 

       
        const angle = (Math.PI / 180) * windDirection;
        const vx = windSpeed * Math.cos(angle);
        const vy = windSpeed * Math.sin(angle);

      
        windData.forEach((particle) => {
            particle.vx = vx * (Math.random() * 0.5 + 0.5);
            particle.vy = vy * (Math.random() * 0.5 + 0.5);
        });
        console.log("Updated particles with wind data"); 
    } catch (error) {
        console.error("Error fetching wind data:", error);
    }
}


fetchWindData();


setInterval(fetchWindData, 300000);

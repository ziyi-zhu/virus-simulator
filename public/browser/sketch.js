const colour = ['#95a5a6', '#F39C12', '#E74C3C', '#2C3E50', '#3498DB'];

let canvas;
let herd;

let selected;

let population = 5000;
let socialDistancing = 2;
let distribution = "gaussian";
let isolation = true;
let infectivity = 0.2;
let fatality = 0.05;
let incubationPeriod = 2;
let recoveryPeriod = 5;
let immunity = true;

let virus;

let paused = true;

$("#tutorial").modal("show");

$("#simulate").click(function() {
  paused = false;
  $("#pause").removeClass("disabled");
  $("#simulate").addClass("disabled");
});

$("#pause").click(function() {
  if (paused) {
    $("#pause").text("Pause");
  } else {
    $("#pause").text("Resume");
  }
  paused = !paused;
});

$(".speed").click(function(event) {
  frameRate(parseInt(event.target.id));
});

$("#target").submit(function(event) {
  event.preventDefault()

  population = $("#inputSize").val();
  socialDistancing = $("#distancingSelect").children("option:selected").val();
  distribution = $("#distributionSelect").children("option:selected").val();
  incubationPeriod = $("#incubationSelect").children("option:selected").val();
  recoveryPeriod = $("#recoverySelect").children("option:selected").val();

  infectivity = $('#infectivity').val() / 100;
  fatality = $('#fatality').val() / 100;

  isolation = $('#isolation').is(":checked");
  immunity = $('#immunity').is(":checked");

  herd = new Herd(population, socialDistancing, distribution, isolation, width, height);
  virus = new Virus(infectivity, fatality, incubationPeriod, recoveryPeriod, immunity);

  $("#pause").text("Pause");
  $("#pause").addClass("disabled");
  paused = true;

  $("#simulate").removeClass("disabled");

  count = [population, 0, 0, 0, 0];
  updateProgress(count);
});

function setup() {
  if (windowWidth < 750) {
    canvas = createCanvas(windowWidth - 50, windowHeight - 150);
  } else {
    canvas = createCanvas(windowWidth * 0.667 - 20, windowHeight - 150);
  }
  canvas.parent('sketch-holder');
  noStroke();

  background('white');

  herd = new Herd(population, socialDistancing, distribution, isolation, width, height);
  virus = new Virus(infectivity, fatality, incubationPeriod, recoveryPeriod, immunity);
}

function windowResized() {
  if (windowWidth < 750) {
    resizeCanvas(windowWidth - 20, windowHeight - 150);
  } else {
    resizeCanvas(windowWidth * 0.667 - 20, windowHeight - 150);
  }
}

function draw() {
  if (!paused) {
    let boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
    let qtree = new QuadTree(boundary, 4);

    let count = [0, 0, 0, 0, 0];

    for (let human of herd.array){
      human.move();
      human.update();

      count[human.status]++;

      let p = new Point(human.x, human.y, human);
      qtree.insert(p);
    }

    updateProgress(count);

    for (let human of herd.array){
      if (human.status == 1 || (human.status == 2 && !human.isolation)) {
        let range = new Circle(human.x, human.y, human.diameter);
        let points = qtree.query(range);
        for (let point of points) {
          let other = point.userData;
          // for (let other of particles) {
          if (human !== other && (other.status == 0 || (other.status == 4 && other.virus.immunity == false)) && human.intersects(other)) {
            other.status = 1;
            other.virus = virus;
          }
        }
      }
    }
    let range = new Circle(mouseX, mouseY, 10);
    selected = qtree.query(range);
  }
  background('white');
  herd.display();
}

function mouseClicked() {
  if (selected) {
    for (let p of selected) {
      p.userData.status = 1;
      p.userData.virus = virus;
    }
  }
}

function updateProgress(count) {
  let total = count[0] + count[1] + count[2] + count[3] + count[4];
  for (let i = 0; i < 5; i++) {
    $(`#${i}.progress-bar`).css("width", `${Math.ceil(count[i] / total * 100)}%`);
    $(`#${i}.count`).text(`${count[i]}`);
  }
}
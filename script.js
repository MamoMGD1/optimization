const cityHeight = 10;
const cityWidth = 10;
const speed = 100;
const attempts = 20;
let goOn = true;
let nOfHouses = 0;
let nOfHospitals = 0;
let totalCost = 0;
let cityBluePrint = [];
let hospitals = [];
let houses = [];
let advantages = [];
let sayac = 0;

document.addEventListener("DOMContentLoaded", ()=>{
    //create a city with random houses
    for(let i = 0; i < cityHeight; i++){
        const row = [];
        for(let j = 0; j < cityWidth; j++){
            const tile = document.createElement("div");
            tile.className = "tile";
            if(Math.random() > 0.98){
                tile.classList.add("house");
                nOfHouses++;
            }
            //Give control permissions
            tile.addEventListener("click", function(){
                if(!(tile.classList.contains("hospital")||tile.classList.contains("house"))){
                    tile.classList.add("hospital");
                    nOfHospitals++;
                }
                else if(tile.classList.contains("hospital")){
                    tile.classList.remove("hospital");
                    nOfHospitals--;
                }
                document.getElementById("hospitalNumber").textContent = nOfHospitals;
                setNearestHospitals(cityBluePrint);
                updateTotalCost();
            });
            tile.addEventListener("contextmenu", function(event){
                event.preventDefault();
                if(!(tile.classList.contains("house")||tile.classList.contains("hospital"))){
                    tile.classList.add("house");
                    nOfHouses++;
                }
                else if(tile.classList.contains("house")){
                    tile.classList.remove("house");
                    nOfHouses--;
                }
                document.getElementById("houseNumber").textContent = nOfHouses;
                setNearestHospitals(cityBluePrint);
                updateTotalCost();
            });
            document.getElementById("houseNumber").textContent = nOfHouses;
            document.querySelector(".city").appendChild(tile);
            row.push({tile: tile, iIndex: i, jIndex: j, nearestHospital: tile, distance: 0});
        }
        cityBluePrint.push(row);
    }
    spotElements();
});
function optimize(){
    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            sayac++;
            setNearestHospitals(cityBluePrint);
            findBetterSolution();
            updateTotalCost();
            advantages.push(totalCost);
            if(advantages.length >= 3 && advantages[advantages.length-1] === advantages[advantages.length-3]){
                clearInterval(intervalId);
                resolve();
            }
        }, speed);
        if(totalCost !== 0)document.querySelectorAll("button")[1].disabled = false;
    });
}
function setNearestHospitals(array){
    spotElements();
    for(let i = 0; i < cityHeight; i++){
        for(let j = 0; j < cityWidth; j++){
            if(array[i][j].tile.classList.contains("house")){
                let currentHouse = array[i][j];
                let nearestHospital = currentHouse;
                let distance = cityHeight+cityWidth+1; 
                hospitals.forEach(hospital =>{
                    if(calculateDistance(currentHouse, hospital)<distance){
                        distance = calculateDistance(currentHouse, hospital);
                        nearestHospital = hospital;
                    }
                });
                currentHouse.nearestHospital = nearestHospital;
                currentHouse.distance = distance;
            }
        }
    }
}
function updateTotalCost(){
    setNearestHospitals(cityBluePrint);
    let totalDistance = 0;
    houses.forEach(house => {
        if(house.distance < 21)
            totalDistance += house.distance;
    });
    document.getElementById("totalCost").textContent = totalDistance;
    totalCost = totalDistance;
}
function calculateDistance(a,b){
    let distance = 0;
    distance+=Math.abs(a.iIndex-b.iIndex);
    distance+=Math.abs(a.jIndex-b.jIndex);
    return distance;
}
function spotElements(){
    //collect all the hospitals and houses in arrays
    hospitals.length = 0;
    houses.length = 0;
    for(let i = 0; i < cityHeight; i++){
        for(let j = 0; j < cityWidth; j++){
            if(cityBluePrint[i][j].tile.classList.contains("hospital"))
                hospitals.push(cityBluePrint[i][j]);
            else if(cityBluePrint[i][j].tile.classList.contains("house"))
                houses.push(cityBluePrint[i][j]);
        }
    }
}
function findBetterSolution(){
    let bestDistance = Number(document.getElementById("totalCost").textContent);
    let deltaI = [-1,0,0,1,-1,-1,1,1];
    let deltaJ = [0,-1,1,0,-1,1,-1,1];
    //change the place of every hospital
    hospitals.forEach(hospital =>{
        bestDistance = Number(document.getElementById("totalCost").textContent);
        let newI = hospital.iIndex;
        let newJ = hospital.jIndex;
        let bestI = hospital.iIndex;
        let bestJ = hospital.jIndex;

        for(let i = 0; i < deltaI.length; i++){
            newI=hospital.iIndex+deltaI[i];
            newJ=hospital.jIndex+deltaJ[i];
            if( newI >= 0 && newI < cityHeight &&
                newJ >= 0 && newJ < cityWidth &&
                !(cityBluePrint[newI][newJ].tile.classList.contains("hospital") ||
                cityBluePrint[newI][newJ].tile.classList.contains("house"))
            ){
                let newDistance = 0;
                let imgHospital = {iIndex: newI, jIndex: newJ};
                houses.forEach(house => {
                    if(house.nearestHospital === hospital)
                        newDistance += calculateDistance(house, imgHospital);
                });
                if(newDistance < bestDistance){
                    bestDistance = newDistance;
                    bestI = newI;
                    bestJ = newJ;
                }
            }
        }
        cityBluePrint[hospital.iIndex][hospital.jIndex].tile.classList.remove("hospital");
        cityBluePrint[bestI][bestJ].tile.classList.add("hospital");
    });
}
async function tryMore(){
    document.getElementById("disc").textContent="Please Wait Until Searching Is Done!";
    let observations = [];
    hospitals.forEach(hospital => {
        observations.push({iIndex: hospital.iIndex, jIndex: hospital.jIndex});
    });
    let repeatedIndexes = [];
    let bestCost = totalCost;
    for(let i = 0 ; i < attempts; i++){
        hospitals.forEach(hospital => {
            let newI = hospital.iIndex;
            let newJ = hospital.jIndex;
            while(true){
                newI = Math.floor(Math.random()*cityHeight);
                newJ = Math.floor(Math.random()*cityWidth);
                let repeat = {iIndex: newI, jIndex: newJ};
                if(repeatedIndexes.every(index => !(index.iIndex === repeat.iIndex && index.jIndex === repeat.jIndex)) && 
                    !(cityBluePrint[newI][newJ].tile.classList.contains("hospital") || 
                    cityBluePrint[newI][newJ].tile.classList.contains("house"))){
                    repeatedIndexes.push(repeat);
                    break;
                }
            }
            cityBluePrint[hospital.iIndex][hospital.jIndex].tile.classList.remove("hospital");
            cityBluePrint[newI][newJ].tile.classList.add("hospital");
            if(totalCost < bestCost){
                bestCost = totalCost;
                for(let i = 0; i < hospitals.length; i++){
                    observations[i].iIndex = hospitals[i].iIndex;
                    observations[i].jIndex = hospitals[i].jIndex;
                }
            }
        });
        await optimize();
    }
    for(let i = 0; i < hospitals.length; i++){
        cityBluePrint[hospitals[i].iIndex][hospitals[i].jIndex].tile.classList.remove("hospital");
    }
    for(let i = 0; i < hospitals.length; i++){
        cityBluePrint[observations[i].iIndex][observations[i].jIndex].tile.classList.add("hospital");
    }
    updateTotalCost();
    document.getElementById("disc").textContent="Optimization Finished Successfully!";
}

function DateInterval(fromDate, toDate) {
    const dateInterval = {};
    dateInterval.fromDate = fromDate;
    dateInterval.toDate = toDate;
    dateInterval.to = function() {
        return this.toDate
    }
    dateInterval.from = function() {
        return this.fromDate
    }
    dateInterval.contains = function(d) {
        if(!d instanceof Date){
            console.log("Illegal param for DateInterval.contains");
        }
        return d < this.to() && d > this.from();
    }
    return dateInterval;
}

function Event(state) {
    function time() { return state.time }
    function place() { return state.place }
    return {time, place}
}

function DataType(state) {
    function type() { return state.type }
    function unit() { return state.unit }
    return {type, unit}
}

function WeatherData(state) {
    function value() { return state.value }
    return Object.assign({}, {value}, Event(state), DataType(state))
}

function Temperature(value, place, unit) {
    let type = 'Temperature';
    let state = {value, place, type, unit }
    function convertToF() {
        if (state.unit === 'Celsius') {
            state.unit = 'Fahrenheit'
            state.value = state.value * (9 / 5) + 32
        }
    }
    function convertToC() {
        if (state.unit === 'Fahrenheit') {
            state.unit = 'Celsius'
            state.value = (state.value - 32) * (5 / 9)
        }
    }
    return Object.assign({}, {convertToF}, {convertToC}, WeatherData(state))
}

function Precipitation(value, precipitationType, place, unit) {
    let type = 'Precipitation';
    let state = {value, place, type, unit}
    function precipitationType() { return precipitationType }
    function convertToInches() {
        if (state.unit === 'MM') {
            state.unit = 'Inches'
            state.value = state.value / 25.4
        }
    }
    function convertToMM() {
        if (state.unit === 'Inches') {
            state.unit = 'MM'
            state.value = state.value * 25.4
        }
    }
    return Object.assign({}, {precipitationType}, {convertToInches}, {convertToMM}, WeatherData(state))
}

function Wind(value, direction, place, unit) {
    let type = 'Wind'
    let state = {value, place, type, unit}
    function direction() { return direction }
    function convertToMPH() {
        if (state.unit === 'MS') {
            state.unit = 'MPH'
            state.value = state.value * 2.237
        }
    }
    function convertToMS() {
        if (state.unit === 'MPH') {
            state.unit = 'MS'
            state.value = state.value / 2.237
        }
    }
    return Object.assign({}, {direction}, {convertToMPH}, {convertToMS}, WeatherData(state))
}

function CloudCoverage(value, place) {
    let type = 'Cloud Coverage'
    let state = {value, place, type}
    return Object.assign({}, WeatherData(state))
}

const WeatherHistory = function (data) {
    const weatherHistory = {};
    weatherHistory.weatherData = data;
    weatherHistory.currentPlace = '';
    weatherHistory.currentType = '';
    weatherHistory.currentPeriod = new DateInterval(new Date(), new Date());
    weatherHistory.getCurrentPlace = function () {
        return this.currentPlace;
    }

    weatherHistory.setCurrentPlace = function (place) {
        this.currentPlace = place;
    }

    weatherHistory.clearCurrentPlace = function () {
        this.currentPlace = '';
    }

    weatherHistory.getCurrentType = function () {
        return this.currentType;
    }

    weatherHistory.setCurrentType = function (type) {
        this.currentType = type;
    }

    weatherHistory.clearCurrentType = function () {
        this.currentType = '';
    }

    weatherHistory.getCurrentPeriod = function () {
        return this.currentPeriod;
    }

    weatherHistory.setCurrentPeriod = function (period) {
        this.currentPeriod = period;
    }

    weatherHistory.clearCurrentPeriod = function () {
        this.currentPeriod = new DateInterval(new Date(), new Date());
    }

    weatherHistory.convertToUSUnits = function () {
        this.weatherData.forEach((x) => {
            if(x.hasOwnProperty('convertToF')){
                x.convertToF();
            }
            if(x.hasOwnProperty('convertToMPH')){
                x.convertToMPH();
            }
            if(x .hasOwnProperty('convertToInches')){
                x.convertToInches();
            }
        })
    }

    weatherHistory.convertToInternationalUnits = function () {
        this.weatherData.forEach((x) => {
            if(x.hasOwnProperty('convertToC')){
                x.convertToC();
            }
            if(x.hasOwnProperty('convertToMS')){
                x.convertToMS();
            }
            if(x.hasOwnProperty('convertToMM')){
                x.convertToMM();
            }
        })
    }

    weatherHistory.add = function (data) {
        this.weatherData.concat(data);
    }

    weatherHistory.data = function() {
        return this.weatherData;
    }

    return weatherHistory;
}

function WeatherPrediction(state) {
    function to() { return state.to }
    function from() { return state.from }

    function matches(data) {
        //logic for when the items are of different types
        let result = data.value() <= to() && data.value() >= from();
        let thisunittype = ['MM','Celsius','MS'].includes(state.unit) &&
        (this.hasOwnProperty('convertToC') || this.hasOwnProperty('convertToMS') || this.hasOwnProperty('convertToMM')) ? "int" : "us";
        let thatunittype = ['MM','Celsius','MS'].includes(data.unit()) &&
        (data.hasOwnProperty('convertToC') || data.hasOwnProperty('convertToMS') || data.hasOwnProperty('convertToMM')) ? "int" : "us";
        //convert get result and convert back
        if(thatunittype === "int" && thisunittype === "us"){
            if(this.hasOwnProperty('convertToC')){
                this.convertToC();
                result = data.value() <= to() && data.value() >= from();
                this.convertToF();
            }
            if(this.hasOwnProperty('convertToMS')){
                this.convertToMS();
                result = data.value() <= to() && data.value() >= from();
                this.convertToMPH();
            }
            if(this.hasOwnProperty('convertToMM')){
                this.convertToMM();
                result = data.value() <= to() && data.value() >= from();
                this.convertToInches();
            }
        } else if (thatunittype === "us" && thisunittype === "int") {
            if(this.hasOwnProperty('convertToF')){
                this.convertToF();
                result = data.value() <= to() && data.value() >= from();
                this.convertToC();
            }
            if(this.hasOwnProperty('convertToMPH')){
                this.convertToMPH();
                result = data.value() <= to() && data.value() >= from();
                this.convertToMS();
            }
            if(this.hasOwnProperty('convertToInches')){
                this.convertToInches();
                result = data.value() <= to() && data.value() >= from();
                this.convertToMM();
            }
        }

        return result;
    }
    return Object.assign({}, {to}, {from}, {matches}, Event(state), DataType(state))
}

function TemperaturePrediction(from, to, place, unit) {
    let type = 'Temperature'
    let state = {from, to, place, type, unit}
    function convertToF(){
        if(state.unit === 'Celsius'){
            state.to = (state.to * 9/5) + 32;
            state.from = (state.from * 9/5) + 32;
            state.unit = 'Fahrenheit'
        }
    }
    function convertToC(){
        if(state.unit === 'Fahrenheit') {
            state.to = (state.to - 32) * 5 / 9;
            state.from = (state.from - 32) * 5 / 9;
            state.unit = 'Celsius';
        }
    }
    return Object.assign({}, {convertToC},  {convertToF}, WeatherPrediction(state))
}

function PrecipitationPrediction(from, to, typesVar, place, unit) {
    let type = 'Precipitation'
    let state = {from, to, place, type, unit}
    function types() { return typesVar }
    function matches(data) {
        return types().includes(data.precipitationType()) && WeatherPrediction(state).matches(data);
    }
    function convertToInches(){
        if(state.unit === 'MM'){
            state.to = state.to / 25.4;
            state.from = state.from / 25.4;
            state.unit = 'Inches';
        }
    }

    function convertToMM(){
        if(state.unit === 'Inches') {
            state.to = state.to * 25.4;
            state.from = state.from * 25.4;
            state.unit = 'MM';
        }
    }
    return Object.assign({}, {types}, {matches}, {convertToInches}, {convertToMM}, WeatherPrediction(state))
}

function WindPrediction(from, to, directionsVar, place, unit) {
    let type = 'Wind'
    let state = {from, to, place, type, unit}
    function directions() { return directionsVar }
    function matches(data) {
        return directions().includes(data.direction()) && WeatherPrediction(state).matches(data);
    }
    function convertToMPH(){
        if(state.unit === 'MS'){
            state.to = state.to * 2.237;
            state.from = state.from * 2.237;
            state.unit = 'MPH'
        }
    }
    function convertToMS(){
        if(state.unit === 'MPH'){
            state.to = state.to / 2.237;
            state.from = state.from / 2.237;
            state.unit = 'MS'
        }
    }
    return Object.assign({}, {matches}, {convertToMPH}, {convertToMS}, WeatherPrediction(state))
}

function CloudCoveragePrediction(from, to, place){
    let type = 'Cloud Coverage'
    let state = {from, to, place, type}
    return Object.assign({}, WeatherPrediction(state))
}

const WeatherForecast = function (data) {
    const weatherForecast = {};
    weatherForecast.weatherPredictions = data;
    weatherForecast.currentPlace = '';
    weatherForecast.currentType = '';
    weatherForecast.currentPeriod = new DateInterval(new Date(), new Date());
    weatherForecast.getCurrentPlace = function () {
        return this.currentPlace;
    }

    weatherForecast.setCurrentPlace = function (place) {
        this.currentPlace = place;
    }

    weatherForecast.clearCurrentPlace = function () {
        this.currentPlace = '';
    }

    weatherForecast.getCurrentType = function () {
        return this.currentType;
    }

    weatherForecast.setCurrentType = function (type) {
        this.currentType = type;
    }

    weatherForecast.clearCurrentType = function () {
        this.currentType = '';
    }

    weatherForecast.getCurrentPeriod = function () {
        return this.currentPeriod;
    }

    weatherForecast.setCurrentPeriod = function (period) {
        this.currentPeriod = period;
    }

    weatherForecast.clearCurrentPeriod = function () {
        this.currentPeriod = new DateInterval(new Date(), new Date());
    }

    weatherForecast.convertToUSUnits = function () {
        this.weatherPredictions.forEach((x) => {
            if(x.hasOwnProperty('convertToF')){
                x.convertToF();
            }
            if(x.hasOwnProperty('convertToMPH')){
                x.convertToMPH();
            }
            if(x.hasOwnProperty('convertToInches')){
                x.convertToInches();
            }
        })
    }

    weatherForecast.convertToInternationalUnits = function () {
        this.weatherPredictions.forEach((x) => {
            if(x.hasOwnProperty('convertToC')){
                x.convertToC();
            }
            if(x.hasOwnProperty('convertToMS')){
                x.convertToMS();
            }
            if(x.hasOwnProperty('convertToMM')){
                x.convertToMM();
            }
        })
    }

    weatherForecast.add = function (data) {
        this.weatherPredictions.concat(data);
    }

    weatherForecast.data = function() {
        return this.weatherPredictions;
    }

    return weatherForecast;
}

console.log('///////////////////Temperature Test');
let tmp = new Temperature(4, 'Viborg' , 'Celsius');
tmp.convertToF();
console.log(tmp.value() + ' ' + tmp.unit());
console.log(tmp.type());
tmp.convertToC();
console.log(tmp.value() + ' ' + tmp.unit());
console.log('///////////////////Precipitation Test');
let pc = new Precipitation(40,'Snow', 'Horsens' , 'MM');
pc.convertToInches();
console.log(pc.value() + ' ' + pc.unit());
console.log(pc.type());
pc.convertToMM();
console.log(pc.value() + ' ' + pc.unit());
console.log('///////////////////WindTest');
let wind = new Wind(10, 'NW', 'Aarhus', 'MS');
wind.convertToMPH();
console.log(wind.value() + ' ' + wind.unit());
console.log(wind.type());
wind.convertToMS();
console.log(wind.value() + ' ' + wind.unit());
console.log('///////////////////Cloud Coverage Test');
let cc = new CloudCoverage(10, 'Aalborg');
console.log(cc.value() + ' ' + cc.unit());
console.log(cc.type());
console.log('/////////////////// History Test');
let history = new WeatherHistory([tmp, pc, wind, cc]);
history.data().forEach((x) => {
    console.log(x.type());
    console.log(x.value() + ' ' + x.unit());
});
console.log('///////////////////');
history.convertToUSUnits();
history.data().forEach((x) => {
    console.log(x.type());
    console.log(x.value() + ' ' + x.unit());
});
console.log('///////////////////END OF HISTORY TEST///////////////////');

function log_prediction(x){
    console.log(`FROM ${x.from()} TO ${x.to()} : ${x.unit()}`);
}

console.log('///////////////////Temperature Prediction Test');
let tmpp = new TemperaturePrediction(3,4, 'Viborg' , 'Celsius');
log_prediction(tmpp);
tmpp.convertToF();
log_prediction(tmpp);
console.log(tmpp.type());
tmpp.convertToC();
log_prediction(tmpp);
console.log('///////////////////Precipitation Prediction Test');
let pcp = new PrecipitationPrediction(28,40,['Snow', 'light_rain'], 'Horsens' , 'MM');
pcp.convertToInches();
log_prediction(pcp);
console.log(pcp.type());
pcp.convertToMM();
log_prediction(pcp);
console.log('///////////////////Wind PredictionTest');
let windp = new WindPrediction(8,10, ['NW'], 'Aarhus', 'MS');
windp.convertToMPH();
log_prediction(windp);
console.log(wind.type());
windp.convertToMS();
log_prediction(windp);
console.log('///////////////////Cloud Coverage Prediction Test');
let ccp = new CloudCoveragePrediction(9,10, 'Aalborg');
log_prediction(ccp);
console.log(ccp.type());
console.log('/////////////////// Forecast Test');
let foreacst = new WeatherForecast([tmpp, pcp, windp, ccp]);
foreacst.data().forEach((x) => {
    console.log(x.type());
    log_prediction(x);
});
console.log('///////////////////');
foreacst.convertToUSUnits();
foreacst.data().forEach((x) => {
    console.log(x.type());
    log_prediction(x);
});
console.log('///////////////////END OF FORECAST TEST///////////////////');

console.log('///////////////////Matches TEST///////////////////');
console.log(tmpp.matches(tmp)); //true
console.log(tmpp.matches(new Temperature(2,'Horsens', 'Celsius'))); //false
console.log(pcp.matches(pc));//true
console.log(pcp.matches(new Precipitation(27, 'light_rain','Horsens', 'MM')));//false
console.log(pcp.matches(new Precipitation(29, 'light_rain','Horsens', 'MM')));//true
class Event{
    constructor() {
        this.eventTime = new Date().getTime();
    }


    time(){
        return this.eventTime;
    }

    place() {
        return 'Horsens';
    }

}

class DataType{
    constructor(type, unit){
        this.datatype = type;
        this.dataunit = unit ? unit : 'unit';
    }

    type(){
        return this.datatype;
    }

    unit() {
        return this.dataunit;
    }

}

class DateInterval{
    interval_from = new Date();
    interval_to = new Date();
    constructor(from, to){
        this.interval_from = from;
        this.interval_to = to;
    }

    from(){
        return this.interval_from;
    }

    to(){
        return this.interval_to;
    }

    contains(d){
        if(!d instanceof Date){
            console.log("Illegal param for DateInterval.contains");
        }
        return d < this.interval_to && d > this.interval_from;
    }
}
class TypedEvent extends DataType{
    constructor(place, type, unit) {
        super(type, unit);
        this.eventTime = new Date();
        this.eventPlace = place;
    }


    time(){
        return this.eventTime;
    }

    place() {
        return this.eventPlace;
    }
}

class WeatherData extends TypedEvent{
    dataValue;

    constructor(value, place, type, unit){
        super(place, type, unit);
        this.dataValue = value;
    }

    value() {
        return this.dataValue;
    }
}

class WeatherPrediction extends TypedEvent{
    pred_to = 0;
    pred_from = 0;

    constructor(from, to, place, type, unit){
        super(place, type, unit);
        this.pred_to= to;
        this.pred_from = from;
    }

    matches(data){
        //logic for when the items are of different types
        let result = data.value() <= this.pred_to && data.value() >= this.pred_from;
        let thisunittype = ['MM','celsius','MS'].includes(this.dataunit) &&
            (this instanceof TemperaturePrediction || this instanceof WindPrediction || this instanceof PrecipitationPrediction) ? "int" : "us";
        let thatunittype = ['MM','celsius','MS'].includes(data.dataunit) &&
            (data instanceof Temperature || data instanceof Wind || data instanceof Precipitation) ? "int" : "us";
            //convert get result and convert back
        if(thatunittype === "int" && thisunittype === "us"){
                if(this instanceof TemperaturePrediction){
                    this.convertToC();
                    result = data.value() <= this.pred_to && data.value() >= this.pred_from;
                    this.convertToF();
                }
                if(this instanceof WindPrediction){
                    this.convertToMS();
                    result = data.value() <= this.pred_to && data.value() >= this.pred_from;
                    this.convertToMPH();
                }
                if(this instanceof PrecipitationPrediction){
                    this.convertToMM();
                    result = data.value() <= this.pred_to && data.value() >= this.pred_from;
                    this.convertToInches();
                }
        } else if (thatunittype === "us" && thisunittype === "int") {
            if(this instanceof TemperaturePrediction){
                this.convertToF();
                result = data.value() <= this.pred_to && data.value() >= this.pred_from;
                this.convertToC();
            }
            if(this instanceof WindPrediction){
                this.convertToMPH();
                result = data.value() <= this.pred_to && data.value() >= this.pred_from;
                this.convertToMS();
            }
            if(this instanceof PrecipitationPrediction){
                this.convertToInches();
                result = data.value() <= this.pred_to && data.value() >= this.pred_from;
                this.convertToMM();
            }
        }

        return result;
    }

    to(){
        return this.pred_to;
    }

    from(){
        return this.pred_from;
    }
}

class Temperature extends WeatherData{
    constructor(value,place, unit){
        super(value, place, 'temperature' , unit )
    }

    convertToF(){
        if(this.unit() === 'celsius'){
            this.dataValue = (this.dataValue * 9/5) + 32;
            this.dataunit = 'fahrenheit'
        }
    }

    convertToC(){
        if(this.unit() === 'fahrenheit') {
            this.dataValue = (this.dataValue - 32) * 5 / 9;
            this.dataunit = 'celsius';
        }
    }
}

class TemperaturePrediction extends WeatherPrediction{
    constructor(from, to,place, unit){
        super(from, to, place, 'temperature' , unit )
    }

    convertToF(){
        if(this.unit() === 'celsius'){
            this.pred_to = (this.pred_to * 9/5) + 32;
            this.pred_from = (this.pred_from * 9/5) + 32;
            this.dataunit = 'fahrenheit'
        }
    }

    convertToC(){
        if(this.unit() === 'fahrenheit') {
            this.pred_to = (this.pred_to - 32) * 5 / 9;
            this.pred_from = (this.pred_from - 32) * 5 / 9;
            this.dataunit = 'celsius';
        }
    }
}

class Precipitation extends WeatherData{
    prectype = '';
    constructor(value, type, place, unit){
        super(value, place, 'precipitation', unit);
        this.prectype = type;
    }

    precipitationType(){
        return this.prectype;
    }

    convertToInches(){
        if(this.unit() === 'MM'){
            this.dataValue = this.dataValue / 25.4;
            this.dataunit = 'INCHES';
        }
    }

    convertToMM(){
        if(this.unit() === 'INCHES') {
            this.dataValue = this.dataValue * 25.4;
            this.dataunit = 'MM';
        }
    }

}

class PrecipitationPrediction extends WeatherPrediction{
    prectypes = [];
    constructor(from, to, types, place, unit){
        super(from, to, place, 'precipitation', unit);
        this.prectypes = types;
    }

    types(){
        return this.prectypes;
    }

    matches(data) {
        return this.prectypes.includes(data.precipitationType()) && super.matches(data);
    }

    convertToInches(){
        if(this.unit() === 'MM'){
            this.pred_to = this.pred_to / 25.4;
            this.pred_from = this.pred_from / 25.4;
            this.dataunit = 'INCHES';
        }
    }

    convertToMM(){
        if(this.unit() === 'INCHES') {
            this.pred_to = this.pred_to * 25.4;
            this.pred_from = this.pred_from * 25.4;
            this.dataunit = 'MM';
        }
    }

}

class Wind extends WeatherData{
    winddir;
    constructor(value, direction, place, unit){
        super(value,place,'wind', unit);
        this.winddir = direction;
    }

    direction() {
        return this.winddir;
    }

    convertToMPH(){
        if(this.unit() === 'MS'){
            this.dataValue = this.dataValue * 2.237;
            this.dataunit = 'MPH'
        }
    }
    convertToMS(){
        if(this.unit() === 'MPH'){
            this.dataValue = this.dataValue / 2.237;
            this.dataunit = 'MS'
        }
    }

}

class WindPrediction extends WeatherPrediction{
    winddirs;
    constructor(from, to, directions, place, unit){
        super(from ,to ,place,'wind', unit);
        this.winddirs = directions;
    }

    directions() {
        return this.winddirs;
    }

    matches(data) {
        return this.winddirs.includes(data.direction()) && super.matches(data);
    }

    convertToMPH(){
        if(this.unit() === 'MS'){
            this.pred_to = this.pred_to * 2.237;
            this.pred_from = this.pred_from * 2.237;
            this.dataunit = 'MPH'
        }
    }
    convertToMS(){
        if(this.unit() === 'MPH'){
            this.pred_to = this.pred_to / 2.237;
            this.pred_from = this.pred_from / 2.237;
            this.dataunit = 'MS'
        }
    }

}

class CloudCoverage extends WeatherData{
    constructor(value, place) {
        super(value, place, 'CloudCoverage', null);
    }
}

class CloudCoveragePrediction extends WeatherPrediction{
    constructor(from, to, place) {
        super(from, to, place, 'CloudCoverage', null);
    }
}

class WeatherHistory {
    weather_data;
    current_place = '';
    current_type = '';
    current_period = new DateInterval(new Date(), new Date());
    constructor(data){
        this.weather_data = data;
    }

    getCurrentPlace(){
        return this.current_place;
    }

    setCurrentPlace(val){
        this.current_place = val;
    }

    clearCurrentPlace(val){
        this.current_place = '';
    }

    getCurrentType(){
        return this.current_type;
    }

    setCurrentType(val){
        this.current_type = val;
    }

    clearCurrentType(val){
        this.current_type = '';
    }

    getCurrentPeriod(){
        return this.current_period;
    }

    setCurrentPeriod(val){
        this.current_period = val;
    }

    clearCurrentPeriod(val){
        this.current_period = new DateInterval(new Date(), new Date());
    }

    convertToUSUnits(){
        this.weather_data.forEach((x) => {
            if(x instanceof Temperature){
                x.convertToF();
            }
            if(x instanceof Wind){
                x.convertToMPH();
            }
            if(x instanceof Precipitation){
                x.convertToInches();
            }
        })
    }

    convertToInternationalUnits(){
        this.weather_data.forEach((x) => {
            if(x instanceof Temperature){
                x.convertToC();
            }
            if(x instanceof Wind){
                x.convertToMS();
            }
            if(x instanceof Precipitation){
                x.convertToMM();
            }
        })
    }

    add(data){
        this.weather_data.concat(data);
    }

    data(){
        return this.weather_data;
    }
}

class WeatherForecast {
    weather_predictions;
    current_place = '';
    current_type = '';
    current_period = new DateInterval(new Date(), new Date());
    constructor(data){
        this.weather_predictions = data;
    }

    getCurrentPlace(){
        return this.current_place;
    }

    setCurrentPlace(val){
        this.current_place = val;
    }

    clearCurrentPlace(val){
        this.current_place = '';
    }

    getCurrentType(){
        return this.current_type;
    }

    setCurrentType(val){
        this.current_type = val;
    }

    clearCurrentType(val){
        this.current_type = '';
    }

    getCurrentPeriod(){
        return this.current_period;
    }

    setCurrentPeriod(val){
        this.current_period = val;
    }

    clearCurrentPeriod(val){
        this.current_period = new DateInterval(new Date(), new Date());
    }

    convertToUSUnits(){
        this.weather_predictions.forEach((x) => {
            if(x instanceof TemperaturePrediction){
                x.convertToF();
            }
            if(x instanceof WindPrediction){
                x.convertToMPH();
            }
            if(x instanceof PrecipitationPrediction){
                x.convertToInches();
            }
        })
    }

    convertToInternationalUnits(){
        this.weather_predictions.forEach((x) => {
            if(x instanceof TemperaturePrediction){
                x.convertToC();
            }
            if(x instanceof WindPrediction){
                x.convertToMS();
            }
            if(x instanceof PrecipitationPrediction){
                x.convertToMM();
            }
        })
    }

    add(data){
        this.weather_predictions.concat(data);
    }

    data(){
        return this.weather_predictions;
    }
}


console.log('///////////////////Temperature Test');
let tmp = new Temperature(4, 'Viborg' , 'celsius');
tmp.convertToF();
console.log(tmp.value() + ' ' + tmp.unit());
console.log(tmp.type());
tmp.convertToC();
console.log(tmp.value() + ' ' + tmp.unit());
console.log('///////////////////Precipitation Test');
let pc = new Precipitation(40,'snow', 'Horsens' , 'MM');
pc.convertToInches();
console.log(pc.value() + ' ' + pc.unit());
console.log(pc.type());
pc.convertToMM();
console.log(pc.value() + ' ' + pc.unit());
console.log('///////////////////WindTest');
let wind = new Wind(10, 'nw', 'Aarhus', 'MS');
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
let tmpp = new TemperaturePrediction(3,4, 'Viborg' , 'celsius');
tmpp.convertToF();
log_prediction(tmpp);
console.log(tmpp.type());
tmpp.convertToC();
log_prediction(tmpp);
console.log('///////////////////Precipitation Prediction Test');
let pcp = new PrecipitationPrediction(28,40,['snow', 'light_rain'], 'Horsens' , 'MM');
pcp.convertToInches();
log_prediction(pcp);
console.log(pcp.type());
pcp.convertToMM();
log_prediction(pcp);
console.log('///////////////////Wind PredictionTest');
let windp = new WindPrediction(8,10, ['nw'], 'Aarhus', 'MS');
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
console.log(tmpp.matches(new Temperature(2,'Horsens', 'celsius'))); //false
console.log(pcp.matches(pc));//true
console.log(pcp.matches(new Precipitation(27, 'light_rain','Horsens', 'MM')));//false
console.log(pcp.matches(new Precipitation(29, 'light_rain','Horsens', 'MM')));//true
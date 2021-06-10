export function DateInterval(fromDate, toDate) {
    const dateInterval = {};
    dateInterval.fromDate = fromDate;
    dateInterval.toDate = toDate;
    dateInterval.to = function () {
        return this.toDate
    }
    dateInterval.from = function () {
        return this.fromDate
    }
    dateInterval.contains = function (d) {
        if (!d instanceof Date) {
            console.log("Illegal param for DateInterval.contains");
        }
        return d < this.to() && d > this.from();
    }
    return dateInterval;
}

export function Event(state) {
    function time() {
        return state.time
    }

    function place() {
        return state.place
    }

    return {time, place}
}

export function DataType(state) {
    function type() {
        return state.type
    }

    function unit() {
        return state.unit
    }

    return {type, unit}
}

export function WeatherData(state) {
    function value() {
        return state.value
    }

    return Object.assign({}, {value}, Event(state), DataType(state))
}

export function Temperature(value, unit, place, time) {
    const temp = {}
    let type = temp.type = 'Temperature';
    temp.state = {value, unit, place, time, type}
    temp.convertToF = function () {
        if (temp.state.unit === 'Celsius') {
            temp.state.unit = 'Fahrenheit'
            temp.state.value = temp.state.value * (9 / 5) + 32
            return temp;
        }
    }
    temp.convertToC = function () {
        if (temp.state.unit === 'Fahrenheit') {
            temp.state.unit = 'Celsius'
            temp.state.value = (temp.state.value - 32) * (5 / 9)
            return temp;
        }
    }
    return Object.assign(temp, WeatherData(temp.state))
}

export function Precipitation(value, precipitationType, unit, place, time) {
    const precipitation = {}
    let type = precipitation.type = 'Precipitation';
    precipitation.state = {value, place, type, unit, time}
    precipitation.precipitationType = function () {
        return precipitationType
    }
    precipitation.convertToInches = function () {
        if (precipitation.state.unit === 'MM') {
            precipitation.state.unit = 'Inches'
            precipitation.state.value = precipitation.state.value / 25.4
            return precipitation;
        }
    }
    precipitation.convertToMM = function () {
        if (precipitation.state.unit === 'Inches') {
            precipitation.state.unit = 'MM'
            precipitation.state.value = precipitation.state.value * 25.4
            return precipitation;
        }
    }
    return Object.assign(precipitation, WeatherData(precipitation.state))
}

export function Wind(value, direction, unit, place, time) {
    const wind = {}
    let type = wind.type = 'Wind'
    wind.state = {value, place, type, unit, time}
    wind.direction = function () {
        return direction
    }
    wind.convertToMPH = function () {
        if (wind.state.unit === 'MS') {
            wind.state.unit = 'MPH'
            wind.state.value = wind.state.value * 2.237
            return wind;
        }
    }
    wind.convertToMS = function () {
        if (wind.state.unit === 'MPH') {
            wind.state.unit = 'MS'
            wind.state.value = wind.state.value / 2.237
            return wind;
        }
    }
    return Object.assign(wind, WeatherData(wind.state))
}

export function CloudCoverage(value, unit, place, time) {
    let type = 'Cloud Coverage'
    let state = {value, unit, place, type, time}
    return Object.assign({}, WeatherData(state))
}

export const WeatherHistory = function (data) {
    const weatherHistory = {};
    weatherHistory.weatherData = data;

    weatherHistory.forPlace = (place) => {
        return new WeatherHistory(weatherHistory.weatherData.filter((x) => x.place() ===place))
    }
    weatherHistory.forType = (type) => {
        return new WeatherHistory(weatherHistory.weatherData.filter((x) => x.type() ===type))
    }
    weatherHistory.forPeriod = (period) => {
        return new WeatherHistory(weatherHistory.weatherData.filter((x) => period.contains(new Date(x.time()))))
    }

    weatherHistory.included = (data) => {
        return new WeatherHistory(weatherHistory.weatherData.concat(data))
    }

    weatherHistory.convertToUSUnits = () => {
        return weatherHistory.weatherData.map((x) => {
            if (x.hasOwnProperty('convertToF')) {
                x.convertToF();
            }
            if (x.hasOwnProperty('convertToMPH')) {
                x.convertToMPH();
            }
            if (x.hasOwnProperty('convertToInches')) {
                x.convertToInches();
            }
        })
    }

    weatherHistory.convertToInternationalUnits = () => {
        return weatherHistory.weatherData.map((x) => {
            if (x.hasOwnProperty('convertToC')) {
                x.convertToC();
            }
            if (x.hasOwnProperty('convertToMS')) {
                x.convertToMS();
            }
            if (x.hasOwnProperty('convertToMM')) {
                x.convertToMM();
            }
        })
    }

    weatherHistory.lowestValue = () => {
        if (weatherHistory.weatherData.length === 0 || !weatherHistory.weatherData.every((x) => x.type() === weatherHistory.weatherData[0].type())) {
            return undefined;
        }
        return weatherHistory.weatherData.reduce((min, p) => p.value() < min ? p.value() : min, weatherHistory.weatherData[0].value());
    }

    weatherHistory.data = function () {
        return weatherHistory.weatherData;
    }

    return weatherHistory;
}

export function WeatherPrediction(state) {
    function to() {
        return state.to
    }

    function from() {
        return state.from
    }

    function matches(data) {
        //logic for when the items are of different types
        let result = data.value() <= to() && data.value() >= from();
        let thisunittype = ['MM', 'Celsius', 'MS'].includes(state.unit) &&
        (this.hasOwnProperty('convertToC') || this.hasOwnProperty('convertToMS') || this.hasOwnProperty('convertToMM')) ? "int" : "us";
        let thatunittype = ['MM', 'Celsius', 'MS'].includes(data.unit()) &&
        (data.hasOwnProperty('convertToC') || data.hasOwnProperty('convertToMS') || data.hasOwnProperty('convertToMM')) ? "int" : "us";
        //convert get result and convert back
        if (thatunittype === "int" && thisunittype === "us") {
            if (this.hasOwnProperty('convertToC')) {
                this.convertToC();
                result = data.value() <= to() && data.value() >= from();
                this.convertToF();
            }
            if (this.hasOwnProperty('convertToMS')) {
                this.convertToMS();
                result = data.value() <= to() && data.value() >= from();
                this.convertToMPH();
            }
            if (this.hasOwnProperty('convertToMM')) {
                this.convertToMM();
                result = data.value() <= to() && data.value() >= from();
                this.convertToInches();
            }
        } else if (thatunittype === "us" && thisunittype === "int") {
            if (this.hasOwnProperty('convertToF')) {
                this.convertToF();
                result = data.value() <= to() && data.value() >= from();
                this.convertToC();
            }
            if (this.hasOwnProperty('convertToMPH')) {
                this.convertToMPH();
                result = data.value() <= to() && data.value() >= from();
                this.convertToMS();
            }
            if (this.hasOwnProperty('convertToInches')) {
                this.convertToInches();
                result = data.value() <= to() && data.value() >= from();
                this.convertToMM();
            }
        }

        return result;
    }

    return Object.assign({}, {to}, {from}, {matches}, Event(state), DataType(state))
}

export function TemperaturePrediction(from, to, unit, place, time) {
    const tempPrediction = {}
    let type = tempPrediction.type = 'Temperature'
    tempPrediction.state = {from, to, place, type, unit, time}
    tempPrediction.convertToF = function () {
        if (tempPrediction.state.unit === 'Celsius') {
            tempPrediction.state.to = (tempPrediction.state.to * 9 / 5) + 32;
            tempPrediction.state.from = (tempPrediction.state.from * 9 / 5) + 32;
            tempPrediction.state.unit = 'Fahrenheit'
            return tempPrediction;
        }
    }
    tempPrediction.convertToC = function () {
        if (tempPrediction.state.unit === 'Fahrenheit') {
            tempPrediction.state.to = (tempPrediction.state.to - 32) * 5 / 9;
            tempPrediction.state.from = (tempPrediction.state.from - 32) * 5 / 9;
            tempPrediction.state.unit = 'Celsius';
            return tempPrediction;
        }
    }
    return Object.assign(tempPrediction, WeatherPrediction(tempPrediction.state))
}

export function PrecipitationPrediction(from, to, typesVar, unit, place, time) {
    const precipitationPrediction = {}
    let type = precipitationPrediction.type = 'Precipitation'
    precipitationPrediction.state = {from, to, place, type, unit, time}
    precipitationPrediction.types = function () {
        return typesVar
    }
    precipitationPrediction.matches = function (data) {
        return precipitationPrediction.types().includes(data.precipitationType()) && WeatherPrediction(precipitationPrediction.state).matches(data);
    }
    precipitationPrediction.convertToInches = function () {
        if (precipitationPrediction.state.unit === 'MM') {
            precipitationPrediction.state.to = precipitationPrediction.state.to / 25.4;
            precipitationPrediction.state.from = precipitationPrediction.state.from / 25.4;
            precipitationPrediction.state.unit = 'Inches';
            return precipitationPrediction;
        }
    }

    precipitationPrediction.convertToMM = function () {
        if (precipitationPrediction.state.unit === 'Inches') {
            precipitationPrediction.state.to = precipitationPrediction.state.to * 25.4;
            precipitationPrediction.state.from = precipitationPrediction.state.from * 25.4;
            precipitationPrediction.state.unit = 'MM';
            return precipitationPrediction;
        }
    }
    return Object.assign(precipitationPrediction, WeatherPrediction(precipitationPrediction.state))
}

export function WindPrediction(from, to, directionsVar, unit, place, time) {
    const windPrediction = {}
    let type = windPrediction.type = 'Wind'
    windPrediction.state = {from, to, place, type, unit, time}
    windPrediction.directions = function () {
        return directionsVar
    }
    windPrediction.matches = function (data) {
        return windPrediction.directions().includes(data.direction()) && WeatherPrediction(windPrediction.state).matches(data);
    }
    windPrediction.convertToMPH = function () {
        if (windPrediction.state.unit === 'MS') {
            windPrediction.state.to = windPrediction.state.to * 2.237;
            windPrediction.state.from = windPrediction.state.from * 2.237;
            windPrediction.state.unit = 'MPH'
            return windPrediction;
        }
    }
    windPrediction.convertToMS = function () {
        if (windPrediction.state.unit === 'MPH') {
            windPrediction.state.to = windPrediction.state.to / 2.237;
            windPrediction.state.from = windPrediction.state.from / 2.237;
            windPrediction.state.unit = 'MS'
            return windPrediction;
        }
    }
    return Object.assign(windPrediction, WeatherPrediction(windPrediction.state))
}

export function CloudCoveragePrediction(from, to, unit, place, time) {
    let type = 'Cloud Coverage'
    let state = {from, to, unit, place, type, time}
    return Object.assign({}, WeatherPrediction(state))
}

export const WeatherForecast = function (data) {
    const weatherForecast = {};
    weatherForecast.weatherPrediction = data;

    weatherForecast.forPlace = (place) => {
        return new WeatherForecast(weatherForecast.weatherPrediction.filter((x) => x.place() === place))
    }
    weatherForecast.forType = (type) => {
        return new WeatherForecast(weatherForecast.weatherPrediction.filter((x) => x.type() === type))
    }
    weatherForecast.forPeriod = (period) => {
        return new WeatherForecast(weatherForecast.weatherPrediction.filter((x) => period.contains(new Date(x.time()))))
    }
    weatherForecast.including = (data) => {
        return new WeatherForecast(weatherForecast.weatherPrediction.concat(data))
    }

    weatherForecast.convertToUSUnits = () => {
        return weatherForecast.weatherPrediction.map((x) => {
            if (x.hasOwnProperty('convertToF')) {
                x.convertToF();
            }
            if (x.hasOwnProperty('convertToMPH')) {
                x.convertToMPH();
            }
            if (x.hasOwnProperty('convertToInches')) {
                x.convertToInches();
            }
        })
    }

    weatherForecast.convertToInternationalUnits = () => {
        return weatherForecast.weatherPrediction.map((x) => {
            if (x.hasOwnProperty('convertToC')) {
                x.convertToC();
            }
            if (x.hasOwnProperty('convertToMS')) {
                x.convertToMS();
            }
            if (x.hasOwnProperty('convertToMM')) {
                x.convertToMM();
            }
        })
    }

    weatherForecast.averageFromValue = (data) => {
        return weatherForecast.weatherPrediction.reduce((avg, value, _, { length }) => {
            return avg + value.from() / length;
        }, 0);
    }

    weatherForecast.averageToValue = (data) => {
        return weatherForecast.weatherPrediction.reduce((avg, value, _, { length }) => {
            return avg + value.to() / length;
        }, 0);
    }

    weatherForecast.data = function () {
        return weatherForecast.weatherPrediction;
    }

    return weatherForecast;
}
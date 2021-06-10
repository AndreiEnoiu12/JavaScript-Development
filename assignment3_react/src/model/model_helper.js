import * as models from './model';

export const convert_to_local_data = array => {
    return array.map(x => {
        if (x.type === 'temperature') {
            return new models.Temperature(x.value, x.unit, x.place, x.time)
        } else if (x.type === 'precipitation') {
            return new models.Precipitation(x.value, x.precipitation_type, x.unit, x.place, x.time)
        } else if (x.type === 'wind speed') {
            return new models.Wind(x.value, x.direction, x.unit, x.place, x.time)
        } else if (x.type === 'cloud coverage') {
            return new models.CloudCoverage(x.value, x.unit, x.place, x.time)
        }
    });
};

export const convert_to_local_predictions = array => {
    return array.map(x => {
        if (x.type === 'temperature') {
            return new models.TemperaturePrediction(x.from, x.to, x.unit, x.place, x.time)
        } else if (x.type === 'precipitation') {
            return new models.PrecipitationPrediction(x.from, x.to, x.type, x.unit, x.place, x.time)
        } else if (x.type === 'wind speed') {
            return new models.WindPrediction(x.from, x.to, x.directions, x.unit, x.place, x.time)
        } else if (x.type === 'cloud coverage') {
            return new models.CloudCoveragePrediction(x.from, x.to, x.unit, x.place, x.time)
        }
    });
};
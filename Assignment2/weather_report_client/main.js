const convert_to_local_data = array => {
    return array.map(x => {
        if (x.type === 'temperature') {
            return new Temperature(x.value, x.unit, x.place, x.time)
        } else if (x.type === 'precipitation') {
            return new Precipitation(x.value, x.precipitation_type, x.unit, x.place, x.time)
        } else if (x.type === 'wind speed') {
            return new Wind(x.value, x.direction, x.unit, x.place, x.time)
        } else if (x.type === 'cloud coverage') {
            return new CloudCoverage(x.value, x.unit, x.place, x.time)
        }
    });
};

const convert_to_local_predictions = array => {
    return array.map(x => {
        if (x.type === 'temperature') {
            return new TemperaturePrediction(x.from, x.to, x.unit, x.place, x.time)
        } else if (x.type === 'precipitation') {
            return new PrecipitationPrediction(x.from, x.to, x.type, x.unit, x.place, x.time)
        } else if (x.type === 'wind speed') {
            return new WindPrediction(x.from, x.to, x.directions, x.unit, x.place, x.time)
        } else if (x.type === 'cloud coverage') {
            return new CloudCoveragePrediction(x.from, x.to, x.unit, x.place, x.time)
        }
    });
};


const init_history = () => {
    fetch('http://localhost:8080/data').then((result) => {
        result.json().then(values => {
                let objects = convert_to_local_data(values);
                let history = new WeatherHistory(objects);
                ex_1(history);
                ex_2(history);
                ex_3(history);
                ex_4(history);
                ex_5(history);
                ex_6(history);
                ex_7(history);
            }
        )
    });
};

const init_forecast = () => {
    fetch('http://localhost:8080/forecast').then((result) => {
        result.json().then(values => {
                let objects = convert_to_local_predictions(values);
                let forecast = new WeatherForecast(objects);
                ex_8(forecast);
        }
        )
    });
};

const init_history_ajax = () => {
    let actions_on_response = (values)  => {
        let objects = convert_to_local_data(values);
    let history = new WeatherHistory(objects);
    ex_1(history);
    ex_2(history);
    ex_3(history);
    ex_4(history);
    ex_5(history);
    ex_6(history);
    ex_7(history);
    }
    let request = new XMLHttpRequest();
    request.responseType = 'json';
    request.addEventListener('load', ()=> {actions_on_response(request.response)});
    request.open("GET", "http://localhost:8080/data" );
    request.send();
};

const init_forecast_ajax = () => {
    let actions_on_response = (values)  => {
        let objects = convert_to_local_predictions(values);
        let forecast = new WeatherForecast(objects);
        ex_8(forecast);
    }
    let request = new XMLHttpRequest();
    request.responseType = 'json';
    request.addEventListener('load', ()=> {actions_on_response(request.response)});
    request.open("GET", "http://localhost:8080/forecast" );
    request.send();
};

const latestEvent = (arr) => {
    return arr.reduce((min, p) => p.time() > min.time() ? p : min, arr[0])
};

const addLi = (parent, text) => {
    let temp_elem = document.createElement('li');
    temp_elem.innerHTML = text;
    parent.appendChild(temp_elem);
};

const ex_1 = (global_history) => {
    let horsens_hist = global_history.forPlace('Horsens');
    let aarh_hist = global_history.forPlace('Aarhus');
    let cph_hist = global_history.forPlace('Copenhagen');
    let fe = document.getElementById('ex_1');
    let displayForCity = (city_history) => {
        let temp = city_history.forType("Temperature");
        let wind = city_history.forType("Wind");
        let cloud = city_history.forType("Cloud Coverage");
        let prec = city_history.forType("Precipitation");
        let last_temp = latestEvent(temp.data());
        let last_wind = latestEvent(wind.data());
        let last_cloud = latestEvent(cloud.data());
        let last_prec = latestEvent(prec.data());
        addLi(fe, `Latest Temperature Entry: ${last_temp.value()} ${last_temp.unit()} ${last_temp.place()} ${last_temp.time()}`);
        addLi(fe, `Latest Wind Entry: ${last_wind.value()} ${last_wind.direction()} ${last_wind.unit()} ${last_wind.place()} ${last_wind.time()}`);
        addLi(fe, `Latest Cloud Coverage Entry: ${last_cloud.value()} ${last_cloud.unit()} ${last_cloud.place()} ${last_cloud.time()}`);
        addLi(fe, `Latest Precipitation Entry: ${last_prec.value()} ${last_prec.unit()} ${last_prec.precipitationType()} ${last_prec.place()} ${last_prec.time()}`);
    }
    displayForCity(horsens_hist);
    displayForCity(aarh_hist);
    displayForCity(cph_hist);
}


const ex_2 = (global_history) => {
    let horsens_hist = global_history.forPlace('Horsens');
    let aarh_hist = global_history.forPlace('Aarhus');
    let cph_hist = global_history.forPlace('Copenhagen');
    let fe = document.getElementById('ex_2');
    let display_data_last_5_days = (city_hist) => {
        let temp = city_hist.forType('Temperature');
        let five_days_ago = new Date();
        five_days_ago.setDate(five_days_ago.getDate() - 5);
        temp = temp.forPeriod(new DateInterval(five_days_ago, new Date()));
        let lowest_temp = temp.lowestValue();
        addLi(fe, `Lowest Temperature for ${city_hist.data()[0].place()} for the last 5 days is ${lowest_temp}`)
    }
    display_data_last_5_days(horsens_hist);
    display_data_last_5_days(aarh_hist);
    display_data_last_5_days(cph_hist);
};


const ex_3 = (global_history) => {
    let horsens_hist = global_history.forPlace('Horsens');
    let aarh_hist = global_history.forPlace('Aarhus');
    let cph_hist = global_history.forPlace('Copenhagen');
    let fe = document.getElementById('ex_3');
    let display_data_last_5_days = (city_hist) => {
        let temp = city_hist.forType('Temperature');
        let five_days_ago = new Date();
        five_days_ago.setDate(five_days_ago.getDate() - 5);
        temp = temp.forPeriod(new DateInterval(five_days_ago, new Date()));
        let lowest_temp = temp.data().reduce((max, p) => p.value() > max ? p.value() : max, temp.data()[0].value());
        addLi(fe, `Highest Temperature for ${city_hist.data()[0].place()} for the last 5 days is ${lowest_temp}`)
    }
    display_data_last_5_days(horsens_hist);
    display_data_last_5_days(aarh_hist);
    display_data_last_5_days(cph_hist);
};

const ex_4 = (global_history) => {
    let horsens_hist = global_history.forPlace('Horsens');
    let aarh_hist = global_history.forPlace('Aarhus');
    let cph_hist = global_history.forPlace('Copenhagen');
    let fe = document.getElementById('ex_4');
    let display_data_last_5_days = (city_hist) => {
        let prec = city_hist.forType('Precipitation');
        let five_days_ago = new Date();
        five_days_ago.setDate(five_days_ago.getDate() - 5);
        prec = prec.forPeriod(new DateInterval(five_days_ago, new Date()));
        let total_prec = prec.data().reduce((total, curr) => total + curr.value(), 0);
        addLi(fe, `Total Precipitation for ${city_hist.data()[0].place()} for the last 5 days is ${total_prec}`)
    };
    display_data_last_5_days(horsens_hist);
    display_data_last_5_days(aarh_hist);
    display_data_last_5_days(cph_hist);
};

const ex_5 = (global_history) => {
    let horsens_hist = global_history.forPlace('Horsens');
    let aarh_hist = global_history.forPlace('Aarhus');
    let cph_hist = global_history.forPlace('Copenhagen');
    let fe = document.getElementById('ex_5');
    let display_data_last_5_days = (city_hist) => {
        let wind = city_hist.forType('Wind');
        let five_days_ago = new Date();
        five_days_ago.setDate(five_days_ago.getDate() - 5);
        wind = wind.forPeriod(new DateInterval(five_days_ago, new Date()));
        let avg_wind = wind.data().reduce((avg, value, _, { length }) => {
            return avg + value.value() / length;
        }, 0);
        addLi(fe, `Average Wind Speed for ${city_hist.data()[0].place()} for the last 5 days is ${avg_wind}`)
    };
    display_data_last_5_days(horsens_hist);
    display_data_last_5_days(aarh_hist);
    display_data_last_5_days(cph_hist);
};


const ex_6 = (global_history) => {
    let horsens_hist = global_history.forPlace('Horsens');
    let aarh_hist = global_history.forPlace('Aarhus');
    let cph_hist = global_history.forPlace('Copenhagen');
    let fe = document.getElementById('ex_6');
    let display_data_last_5_days = (city_hist) => {
        let wind = city_hist.forType('Wind');
        let five_days_ago = new Date();
        five_days_ago.setDate(five_days_ago.getDate() - 5);
        wind = wind.forPeriod(new DateInterval(five_days_ago, new Date()));
        let only_dir = wind.data().map((x)=>{
            return x.direction()
        });
        let avg_wind = only_dir.reduce(
            (a,b,i,arr)=>
                (arr.filter(v=>v===a).length>=arr.filter(v=>v===b).length?a:b),
            0);

        addLi(fe, `Dominant Wind Direction for ${city_hist.data()[0].place()} for the last 5 days is ${avg_wind}`)
    };
    display_data_last_5_days(horsens_hist);
    display_data_last_5_days(aarh_hist);
    display_data_last_5_days(cph_hist);
};


const ex_7 = (global_history) => {
    let horsens_hist = global_history.forPlace('Horsens');
    let aarh_hist = global_history.forPlace('Aarhus');
    let cph_hist = global_history.forPlace('Copenhagen');
    let fe = document.getElementById('ex_7');
    let display_data_last_5_days = (city_hist) => {
        let cc = city_hist.forType('Cloud Coverage');
        let five_days_ago = new Date();
        five_days_ago.setDate(five_days_ago.getDate() - 5);
        cc = cc.forPeriod(new DateInterval(five_days_ago, new Date()));
        let avgcc = cc.data().reduce((avg, value, _, { length }) => {
            return avg + value.value() / length;
        }, 0);
        addLi(fe, `Average Cloud Coverage for ${city_hist.data()[0].place()} for the last 5 days is ${avgcc}`)
    };
    display_data_last_5_days(horsens_hist);
    display_data_last_5_days(aarh_hist);
    display_data_last_5_days(cph_hist);
};

const ex_8 = (forecast) => {
    let in_24_hours = new Date();
    in_24_hours.setHours(in_24_hours.getHours() + 24)
    forecast = forecast.forPeriod(new DateInterval(new Date(), in_24_hours));
    let horsens_for = forecast.forPlace('Horsens');
    let aar_for = forecast.forPlace('Aarhus');
    let cph_for = forecast.forPlace('Copenhagen');
    let fe = document.getElementById('ex_8');
    let display_data_next_24_hours = (city_forecast) => {
        let temp = city_forecast.forType("Temperature");
        let wind = city_forecast.forType("Wind");
        let cloud = city_forecast.forType("Cloud Coverage");
        let prec = city_forecast.forType("Precipitation");
        temp.data().forEach((x) => {
        addLi(fe, `Latest Temperature Entry: From ${x.from()}  to ${x.to()} ${x.unit()} ${x.place()} ${x.time()}`);
        });
        wind.data().forEach((x) => {
        addLi(fe, `Latest Wind Entry: From ${x.from()}  to ${x.to()} ${x.directions()} ${x.unit()} ${x.place()} ${x.time()}`);
        });
        cloud.data().forEach((x) => {
        addLi(fe, `Latest Cloud Coverage Entry: From ${x.from()}  to ${x.to()} ${x.unit()} ${x.place()} ${x.time()}`);
        });
        prec.data().forEach((x) => {
        addLi(fe, `Latest Precipitation Entry: From ${x.from()}  to ${x.to()} ${x.unit()} ${x.types()} ${x.place()} ${x.time()}`);
        });
    }
    display_data_next_24_hours(horsens_for);
    display_data_next_24_hours(aar_for);
    display_data_next_24_hours(cph_for);
};
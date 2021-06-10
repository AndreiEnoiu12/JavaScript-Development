import React, { Component } from 'react';
//import * as models from './model/model';
import * as helpers from './model/model_helper';
import {DateInterval, WeatherForecast, WeatherHistory} from "./model/model";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      WeatherHistory: new WeatherHistory(),
      WeatherForecast: new WeatherForecast(),
      selectedType: 'temperature',
      selectedValue: '0',
      selectedDate: new Date(),
      selectedPlace: 'horsens',
      selectedWindDirection: '',

      historyDataReceived: false,
      forecastDataReceived: false,

      selectedPlaceH: 'Horsens',
      selectedFromDateH: new Date(),
      selectedToDateH: new Date(),

      selectedPlaceF: 'Horsens',
      selectedFromDateF: new Date(),
      selectedToDateF: new Date()
    };
    this.init_history();
    this.init_forecast();;
  }



  handleTypeChange = (event) => {
    this.setState({selectedType: event.target.value}, () => {
      console.log(this.state.selectedType);
    });
  }

  handleValueChange = (event) => {
    this.setState({selectedValue: event.target.value}, () => {
      console.log(this.state.selectedValue);
    });
  }

  handleDateChange = (event) => {
    this.setState({selectedDate: event.target.value}, () => {
      console.log(this.state.selectedDate);
    });
  }


  handlePlaceChange = (event) => {
    this.setState({selectedPlace: event.target.value}, () => {
      console.log(this.state.selectedPlace);
    });
  }


  handleWindDirectionChange = (event) => {
    this.setState({selectedWindDirection: event.target.value}, () => {
      console.log(this.state.selectedWindDirection);
    });
  }

  handlePlaceChangeH= (event) => {
    this.setState({selectedPlaceH: event.target.value}, () => {
      console.log(this.state.selectedPlaceH);
    });
  }

  handleFromDateChangeH = (event) => {
    this.setState({selectedFromDateH: event.target.value}, () => {
      console.log(this.state.selectedFromDateH);
    });
  }

  handleToDateChangeH = (event) => {
    this.setState({selectedToDateH: event.target.value}, () => {
      console.log(this.state.selectedToDateH);
    });
  }

  handlePlaceChangeF= (event) => {
    this.setState({selectedPlaceF: event.target.value}, () => {
      console.log(this.state.selectedPlaceF);
    });
  }

  handleFromDateChangeF = (event) => {
    this.setState({selectedFromDateF: event.target.value}, () => {
      console.log(this.state.selectedFromDateF);
    });
  }

  handleToDateChangeF = (event) => {
    this.setState({selectedToDateF: event.target.value}, () => {
      console.log(this.state.selectedToDateF);
    });
  }

  addHistoricalData = () => {
    let payload = {};
    payload.type = this.state.selectedType;
    payload.place = this.state.selectedPlace;
    payload.value = this.state.selectedValue;
    payload.time = this.state.selectedDate;
    if (this.state.selectedType === 'wind speed') {
      payload.direction = this.state.selectedWindDirection;
      payload.unit = 'm/s';
    } else if (this.state.selectedType === 'temperature') {
      payload.unit = 'C';
    } else if (this.state.selectedType === 'cloud coverage') {
      payload.unit = '%';
    } else if (this.state.selectedType === 'precipitation') {
      payload.unit = 'mm';
    }

    console.log(payload.type, payload.place, payload.value, payload.time, payload.direction, payload.unit)

    let xhr = new XMLHttpRequest()
    xhr.addEventListener('load', () => {
      console.log(xhr.responseText)
    })
    xhr.open('POST', 'http://localhost:8080/data/')
    xhr.send(payload);

    //$http.post("http://localhost:8080/data/", payload).then(() => console.log("SUCCESS ADD")).catch(() => {
    //  console.log("FAIL ADD");
    //});
  }

  displayExtraField = () => {
    if (this.state.selectedType === 'wind speed') {
      return <label> Wind Direction: <input type="text" value={this.state.selectedWindDirection} onChange={this.handleWindDirectionChange}/></label>
    }
  }

  displayHistoryData = () => {
    if (this.state.historyDataReceived === true) {
      return <ul>{this.state.WeatherHistory.data().map((element, index) => <li key={index}>{element.value()} {element.unit()} in {element.place()} on {element.time()}</li>)}</ul>
    }
  }

  displayForecastData = () => {
    if (this.state.forecastDataReceived === true) {
      return <ul>{this.state.WeatherForecast.data().map((element, index) => <li key={index}>{element.type()} from:{element.from()} to:{element.to()} {element.unit()} in {element.place()} on {element.time()}</li>)}</ul>
    }
  }

  render() {
    return(
        <div>
          <div>
            <h3>Add new data here:</h3>
            <label> Type: <select value={this.state.selectedType} onChange={this.handleTypeChange}>
              <option value="temperature">Temperature</option>
              <option value="wind speed">Wind Speed</option>
              <option value="precipitation">Precipitation</option>
              <option value="cloud coverage">Cloud Coverage</option>
            </select></label>
            <label> Value: <input type="number" value={this.state.selectedValue} onChange={this.handleValueChange}/></label>
            <label> Date: <input type="datetime-local" value={this.state.selectedDate} onChange={this.handleDateChange}/></label>
            <label> Place: <select value={this.state.selectedPlace} onChange={this.handlePlaceChange}>
              <option value="horsens">Horsens</option>
              <option value="aarhus">Aarhus</option>
              <option value="copenhagen">Copenhagen</option>
            </select></label>
            <div>{this.displayExtraField()}</div>
            <button onClick={this.addHistoricalData}>Add historical data</button>
          </div>

          <div>
            <div>
              <h3>Weather history:</h3>
              <label> Place: <select value={this.state.selectedPlaceH} onChange={this.handlePlaceChangeH}>
                <option value="Horsens">Horsens</option>
                <option value="Aarhus">Aarhus</option>
                <option value="Copenhagen">Copenhagen</option>
              </select></label>
              <label> From: <input type="date" value={this.state.selectedFromDateH} onChange={this.handleFromDateChangeH}/></label>
              <label> To: <input type="date" value={this.state.selectedToDateH} onChange={this.handleToDateChangeH}/></label>
              <button onClick={this.filter_history}>Apply filter</button>
              <button onClick={this.filter_history}>Refresh with filter</button>
              <button onClick={this.init_history}>Refresh with no filter</button>
              <div>{this.displayHistoryData()}</div>
            </div>

            <div>
              <h3>Weather forecast:</h3>
              <label> Place: <select value={this.state.selectedPlaceF} onChange={this.handlePlaceChangeF}>
                <option value="Horsens">Horsens</option>
                <option value="Aarhus">Aarhus</option>
                <option value="Copenhagen">Copenhagen</option>
              </select></label>
              <label> From: <input type="date" value={this.state.selectedFromDateF} onChange={this.handleFromDateChangeF}/></label>
              <label> To: <input type="date" value={this.state.selectedToDateF} onChange={this.handleToDateChangeF}/></label>
              <button onClick={this.filter_forecast}>Apply filter</button>
              <button onClick={this.filter_forecast}>Refresh with filter</button>
              <button onClick={this.init_forecast}>Refresh with no filter</button>
              <div>{this.displayForecastData()}</div>
            </div>
          </div>

        </div>
    );
  }

  filter_history = () => {
    fetch('http://localhost:8080/data')
        .then(res => res.json())
        .then((data) => {
          let objects = helpers.convert_to_local_data(data);
          this.setState({ WeatherHistory: new WeatherHistory(objects)}, () => {
            //not working because of incompatible DATE formats//.forPeriod(new DateInterval(this.state.selectedFromDateH, this.state.selectedToDateH))
            this.setState({WeatherHistory: this.state.WeatherHistory.forPlace(this.state.selectedPlaceH)}, () => {
              console.log("Data Changed")
              console.log(this.state.WeatherHistory.data())
              this.displayHistoryData();
            });
          });
        })
        .catch(console.log)
  }

  filter_forecast = () => {
    fetch('http://localhost:8080/forecast')
        .then(res => res.json())
        .then((data) => {
          let objects = helpers.convert_to_local_predictions(data);
          this.setState({WeatherForecast : new WeatherForecast(objects)}, () => {
            //not working because of incompatible DATE formats//.forPeriod(new DateInterval(this.state.selectedFromDateF, this.state.selectedToDateF))
            this.setState({WeatherForecast: this.state.WeatherForecast.forPlace(this.state.selectedPlaceF)}, () => {
              console.log("Data Changed")
              console.log(this.state.WeatherForecast.data())
              this.displayForecastData();
            });
          });
        })
        .catch(console.log)
  }


  init_history = () => {
    fetch('http://localhost:8080/data')
        .then(res => res.json())
        .then((data) => {
          let objects = helpers.convert_to_local_data(data);
          this.setState({ WeatherHistory: new WeatherHistory(objects)}, () => {
            this.setState({ historyDataReceived: true})
            console.log("History Data Received")
            console.log(this.state.WeatherHistory.data())
          });
        })
        .catch(console.log)
  }

  init_forecast = () => {
    fetch('http://localhost:8080/forecast')
        .then(res => res.json())
        .then((data) => {
          let objects = helpers.convert_to_local_predictions(data);
          this.setState({ WeatherForecast: new WeatherForecast(objects)}, () => {
            this.setState({ forecastDataReceived: true})
            console.log("Forecast Data Received")
            console.log(this.state.WeatherForecast.data())
          });
        })
        .catch(console.log)
  }
}
export default App;